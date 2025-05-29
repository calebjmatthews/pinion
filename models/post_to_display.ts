export default class PostToDisplay {
  id: string = '';
  userId: string = '';
  userName: string = '';
  userThumbnail?: string;
  createdAt: Date = new Date();
  createdAtLabel: string = '';
  body: string = '';

  constructor(postToDisplay: PostToDisplayInterface, options?: { locale?: string }) {
    Object.assign(this, postToDisplay);

    this.createdAtLabel = getCreatedAtLabel({ date: this.createdAt, locale: options?.locale });
  };
};

const getCreatedAtLabel = (args: { date: Date, locale?: string }) => {
  const { date, locale } = args;
  const day = date.toLocaleDateString(locale, { day: "numeric" });
  const month = date.toLocaleDateString(locale, { month: "short" });
  const year = date.toLocaleDateString(locale, { year: "numeric" });
  const [time, ampm, timezone] = date.toLocaleTimeString(locale, { hour: "numeric", minute: "numeric", timeZoneName: "short" }).split(" ");
  return `${day} ${month} ${year} ${time} ${ampm} (${timezone})`;
};

interface PostToDisplayInterface {
  id: string;
  userId: string;
  userName: string;
  userThumbnail?: string;
  createdAt: Date;
  createdAtLabel?: string;
  body: string;
};