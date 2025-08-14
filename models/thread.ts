import Post from "./post";

export default class Thread {
  id: string = '';
  rootPostId: string = '';
  postIds: string[] = [];
  posts: Post[] = [];
  ancestorThreadIds: string[] = [];
  descendentThreadIds: string[] = [];
  depth: number = 0;
  createdAt: Date = new Date();
  lastAddedTo: Date = new Date();

  constructor(thread?: ThreadInterface) {
    if (thread) Object.assign(this, thread);
  };

  fromDB(threadFromDB: ThreadFromDBInterface) {
    const { root_post_id, post_ids, ancestor_thread_ids, descendent_thread_ids, created_at, last_added_to } = threadFromDB;
    return new Thread({
      ...threadFromDB,
      rootPostId: root_post_id,
      postIds: post_ids ? post_ids.slice(1, -1).split(',') : [],
      ancestorThreadIds: ancestor_thread_ids ? ancestor_thread_ids.slice(1, -1).split(',') : [],
      descendentThreadIds: descendent_thread_ids ? descendent_thread_ids.slice(1, -1).split(',') : [],
      createdAt: created_at,
      lastAddedTo: last_added_to
    });
  }
};

interface ThreadInterface {
  id: string;
  rootPostId: string;
  postIds: string[];
  ancestorThreadIds: string[];
  descendentThreadIds: string[];
  depth: number;
  createdAt: Date;
  lastAddedTo: Date;
};

export interface ThreadFromDBInterface {
  id: string;
  root_post_id: string;
  post_ids: string;
  ancestor_thread_ids: string;
  descendent_thread_ids: string;
  depth: number;
  created_at: Date;
  last_added_to: Date;
}