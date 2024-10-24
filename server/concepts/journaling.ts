import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface JournalDoc extends BaseDoc {
  owner: ObjectId;
  title: string;
  objects: object[];
}

/**
 * concept: Journaling
 *
 */
export default class JournalingConcept {
  public readonly journals: DocCollection<JournalDoc>;

  /**
   * Make an instance of Journaling.
   */
  constructor(collectionName: string) {
    this.journals = new DocCollection<JournalDoc>(collectionName);
  }

  async create(title: string, owner: ObjectId) {
    await this.assertUniqueJournal(title, owner);
    const _id = await this.journals.createOne({ title, owner, objects: [] });
    return { msg: "Journal created successfully!", journalid: _id };
  }

  async getJournalById(_id: ObjectId) {
    const journal = await this.journals.readOne({ _id });
    if (journal == null) {
      throw new NotFoundError(`No Journal found with id: ${_id.toString()}`);
    }
    return journal;
  }

  async getJournalByName(title: string, owner: ObjectId) {
    const journal = await this.journals.readOne({ title, owner });
    if (journal == null) {
      throw new NotFoundError(`No Journal found with title: ${title} and owner: ${owner}`);
    }
    return journal;
  }

  async getAllJournals() {
    return await this.journals.readMany({}, { sort: { _id: -1 } });
  }

  async addObject(_id: ObjectId, object: ObjectId) {
    const journal = await this.journals.readOne({ _id });
    if (journal == null) {
      throw new NotFoundError(`No Journal found with that name`);
    }
    if (journal.objects.some((obj) => obj.equals(object))) {
      throw new NotAllowedError(`${object.toString()} already inside journal`);
    }

    journal.objects.push(object);
    await this.journals.partialUpdateOne({ _id }, { objects: journal.objects });
    return { msg: "Added object succesfully!" };
  }

  async assertUniqueJournal(title: string, owner: ObjectId) {
    if (await this.journals.readOne({ title, owner })) {
      throw new NotAllowedError(`Journal with name: ${title} with owner: ${owner} already exists`);
    }
  }

  //Removes an object from a specific journal
  async removeObject(_id: ObjectId, objectRem: ObjectId) {
    const journal = await this.journals.readOne({ _id });
    if (journal == null) {
      console.log("1");
      throw new NotFoundError(`No Journal found with id: ${_id.toString()}`);
    }
    if (!journal.objects.some((obj) => obj.equals(objectRem))) {
      console.log("2");
      throw new NotFoundError(`${objectRem} not found in journal: ${_id}`);
    }
    const contents = journal.objects.filter((obj) => !obj.equals(objectRem));
    await this.journals.partialUpdateOne({ _id }, { objects: contents });
    return { msg: "Removed object succesfully!" };
  }

  async removeObjectFromAll(objectRem: ObjectId) {
    const journals = await this.journals.readMany({ objects: { $in: [objectRem] } });
    console.log("length:" + journals.length);
    if (!journals) {
      throw new NotFoundError(`No Journal found containing: ${objectRem}`);
    }

    for (const journal of journals) {
      const contents = journal.objects.filter((obj) => !obj.equals(objectRem));
      await this.journals.partialUpdateOne({ _id: journal._id }, { objects: contents }); //this could be very slow for a lot of journals
    }
    return { msg: "Succesfully removed entry from all journals!" };
  }

  async delete(_id: ObjectId) {
    await this.journals.deleteOne({ _id });
    return { msg: "Journal deleted" };
  }

  async assertJournalContains(_id: ObjectId, object: ObjectId) {
    const journal = await this.journals.readOne({ _id });
    if (journal == null) {
      throw new NotFoundError(`Journal was not found`);
    }
    if (!journal.objects.some((obj) => obj.equals(object))) {
      throw new NotFoundError(`Journal did not contain object: ${object}`);
    }
  }
}
