import logDatetime from "./log_datetime";

const sqlMiddleware = async (query: Bun.SQLQuery, name: string, args?: any) => {
  if (process.env.DEBUG_SQL === 'all') {
    console.log(`${logDatetime()}: query ${name} with args ${args ? JSON.stringify(args) : 'empty'}.`);
  }
  try {
    const result = await query.execute();
    return result;
  }
  catch(err) {
    console.log(`${logDatetime()}: Error during SQL query execution.`);
    console.log(`Error:`, err);
    console.log(`Erroring query ${name} with args ${args ? JSON.stringify(args) : 'empty'}.`);
    return [];
  };
};

export default sqlMiddleware;