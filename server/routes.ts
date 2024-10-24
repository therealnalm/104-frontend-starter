import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Journaling, Permissioning, Posting, Sessioning, Threading } from "./app";
import { PostDoc, PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";
import { NotAllowedError } from "./concepts/errors";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.post("/thread")
  async createThread(session: SessionDoc, journalid: string, entryid: string, headid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    const head = new ObjectId(headid);
    await Permissioning.hasPerm(user, journal);
    await Journaling.assertJournalContains(journal, head);
    await Journaling.assertJournalContains(journal, entry);
    return await Threading.addToThread(head, entry, journal);
  }

  @Router.delete("/thread")
  async removeFromThread(session: SessionDoc, journalid: string, entryid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    await Permissioning.hasPerm(user, journal);
    return await Threading.unthread(entry, journal);
  }

  @Router.get("/thread/next")
  async getNextInThread(session: SessionDoc, journalid: string, entryid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    await Permissioning.hasPerm(user, journal);
    return await Threading.getNext(entry, journal);
  }

  @Router.get("/thread/prev")
  async getPrevInThread(session: SessionDoc, journalid: string, entryid: ObjectId) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    await Permissioning.hasPerm(user, journal);
    return await Threading.getPrev(entry, journal);
  }

  @Router.get("/thread")
  async getThread(session: SessionDoc, journalid: string, entryid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    await Permissioning.hasPerm(user, journal);
    return await Threading.getThreadIn(entry, journal);
  }

  @Router.post("/journals")
  async createJournal(session: SessionDoc, title: string) {
    const user = Sessioning.getUser(session);
    const output = await Journaling.create(title, user);
    await Permissioning.createPerm(output.journalid);
    await Permissioning.giveUserPerm(user, output.journalid);
    return output;
  }

  @Router.delete("/journals")
  async deleteJournal(session: SessionDoc, journalid: string) {
    const user = Sessioning.getUser(session);
    const _id = new ObjectId(journalid);
    await Permissioning.hasPerm(user, _id);
    const journal = await Journaling.getJournalById(_id);
    if (journal.title == "self") {
      throw new NotAllowedError(`Not allowed to delete self journal`);
    }
    await Permissioning.delPerm(_id);
    return await Journaling.delete(_id);
  }

  @Router.get("/journals")
  async getAllJournals(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const perms = await Permissioning.getAuthorizedActions(user);
    const journals = perms.map((perm) => perm.object);
    return journals;
  }

  @Router.patch("/journals/:journalTitle/:ownerUsername/:entryid")
  async addJournalEntry(session: SessionDoc, journalTitle: string, ownerUsername: string, entryid: string) {
    const journalOwner = await Authing.getUserByUsername(ownerUsername);
    const journal = await Journaling.getJournalByName(journalTitle, journalOwner._id);
    const entry = new ObjectId(entryid);
    const actor = Sessioning.getUser(session);
    await Posting.assertAuthorIsUser(entry, actor);
    await Permissioning.hasPerm(actor, journal._id);
    return await Journaling.addObject(journal._id, entry);
  }

  @Router.delete("/journals/entry/:journalid/:entryid")
  async removeJournalEntry(session: SessionDoc, journalid: string, entryid: string) {
    console.log("up");
    const journal = new ObjectId(journalid);
    const entry = new ObjectId(entryid);
    const user = Sessioning.getUser(session);
    console.log("mm");
    await Permissioning.hasPerm(user, journal);
    console.log("yuh");
    return await Journaling.removeObject(journal, entry);
  }

  @Router.get("/journals/contents/:journalid")
  async getJournalContents(session: SessionDoc, journalid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    await Permissioning.hasPerm(user, journal);
    const result = await Journaling.getJournalById(journal);
    return { msg: `Successfully got journal!`, journal: result };
  }

  @Router.get("/journals/find/:title/:owner")
  async getJournalFromName(session: SessionDoc, title: string, owner: string) {
    const user = Sessioning.getUser(session);
    const jOwner = await Authing.getUserByUsername(owner);
    const journal = await Journaling.getJournalByName(title, jOwner._id);
    await Permissioning.hasPerm(user, journal._id);
    return { msg: `Successfully got journal!`, journal: journal };
  }

  @Router.post("/journals/users/:username")
  async addJournalUser(session: SessionDoc, journalid: string, username: string) {
    const admin = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    await Permissioning.hasPerm(admin, journal);
    const user = await Authing.getUserByUsername(username);
    await Friending.assertFriends(admin, user._id);
    await Permissioning.giveUserPerm(user._id, journal);
    return { msg: `Successfully added user ${user} to journal ${journal} ` };
  }
  //Remove a user from the list of users who have access to a journal. Currently does not also remove any entries of theirs as well.
  //An owner of a journal could potentially remove themselves from a journal as well
  @Router.delete("/journals/users/:username")
  async removeJournalUser(session: SessionDoc, journalid: string, username: string) {
    const admin = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    await Permissioning.hasPerm(admin, journal);
    const user = await Authing.getUserByUsername(username);
    if (user._id.equals(admin)) {
      throw new NotAllowedError("Can't remove journal owner from a journal");
    }
    await Permissioning.removeUserPerm(user._id, journal);
    return { msg: `Successfully removed user ${user} from journal ${journal} ` };
  }
  //Gets a list of authorized users for a journal
  @Router.get("/journals/users/:journalid")
  async getJournalUsers(session: SessionDoc, journalid: string) {
    const user = Sessioning.getUser(session);
    const journal = new ObjectId(journalid);
    await Permissioning.hasPerm(user, journal);
    const result = await Permissioning.getAuthorizedUsers(journal);
    return result;
  }

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/name/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    const output = await Authing.getUserByUsername(username);
    return output;
  }

  @Router.get("/users/id/:id")
  async getUserFromId(id: string) {
    const actId = new ObjectId(id);
    const output = await Authing.getUserById(actId);
    return output;
  }

  //when registering a new user, their own 'self' journal is automatically created
  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    const newUser = await Authing.create(username, password);
    const output = await Journaling.create("self", newUser.user?._id as ObjectId);
    await Permissioning.createPerm(output.journalid);
    await Permissioning.giveUserPerm(newUser.user?._id as ObjectId, output.journalid);
    return newUser;
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  //Need to make sure to also remove user from all journals and delete any that they own
  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    const selfJournal = await Journaling.getJournalByName("self", user);
    const posts = await Posting.getByAuthor(user);
    void (await posts.map(async (post) => {
      await Journaling.removeObjectFromAll(post._id);
      await Posting.delete(post._id);
    }));
    await Journaling.delete(selfJournal._id);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts/all")
  async getPosts(author?: string, journalid?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else if (journalid) {
      const journalId = new ObjectId(journalid);
      const contents = (await Journaling.getJournalById(journalId)).objects as ObjectId[];
      console.log("early: " + contents);
      posts = await Promise.all(
        contents.map(async (postId) => {
          const result = (await Posting.getById(postId)) as PostDoc;
          console.log("result: " + result);
          return result;
        }),
      );
      console.log("posts:" + posts);
      if (posts == null) {
        throw new NotAllowedError("Journal contains non-existent post");
      }
    } else {
      posts = await Posting.getPosts();
      console.log("all: " + posts);
    }
    const result = await Responses.posts(posts);
    return result;
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, options);
    const newPost = await Responses.post(created.post);
    const selfJournal = await Journaling.getJournalByName("self", user);
    await Journaling.addObject(selfJournal._id, newPost?._id as ObjectId);
    return { msg: created.msg, post: newPost };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }
  //Removes post from all journals before deleting
  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    await Journaling.removeObjectFromAll(oid);
    return Posting.delete(oid);
  }

  @Router.get("/posts/content/:id")
  async getPostFromId(session: SessionDoc, id: string) {
    const oid = new ObjectId(id);
    const result = await Posting.getById(oid);
    return result;
  }

  @Router.get("/friends")
  async getAddedFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getAddedFriends(user));
  }

  @Router.delete("/friends")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  // @Router.get("/friend/requests")
  // async getRequests(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Responses.friendRequests(await Friending.getRequests(user));
  // }

  @Router.post("/friends")
  async addFriend(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.addFriend(user, toOid);
  }

  // @Router.delete("/friend/requests/:to")
  // async removeFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.removeRequest(user, toOid);
  // }

  // @Router.put("/friend/accept/:from")
  // async acceptFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.acceptRequest(fromOid, user);
  // }

  // @Router.put("/friend/reject/:from")
  // async rejectFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.rejectRequest(fromOid, user);
  // }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
