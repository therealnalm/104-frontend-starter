import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import JournalingConcept from "./concepts/journaling";
import PermissioningConcept from "./concepts/permissioning";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import ThreadingConcept from "./concepts/threading";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Permissioning = new PermissioningConcept("permissions");
export const Journaling = new JournalingConcept("journals");
export const Threading = new ThreadingConcept("threads");
