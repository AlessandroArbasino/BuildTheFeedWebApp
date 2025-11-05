let neonClientPromise = null;

export const getDbClient = async () => {
  if (!neonClientPromise) {
    neonClientPromise = (async () => {
      const { neon } = await import('@neondatabase/serverless');
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) throw new Error('DATABASE_URL not configured');
      return neon(connectionString);
    })();
  }
  return await neonClientPromise;
};

export const insertPrompt = async (prompt) => {
  const sql = await getDbClient();
  const result = await sql`INSERT INTO prompt_queue (prompt, create_date)
                                VALUES (${prompt}, ${new Date()})
                                RETURNING id`;
  return result?.[0]?.id;
};

export const getAllPrompts = async () => {
  const sql = await getDbClient();
  const rows = await sql`SELECT id, prompt, create_date FROM prompt_queue`;
  return rows;
};

export const countPromptsBeforeId = async (id) => {
  const sql = await getDbClient();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM prompt_queue WHERE id < ${id}`;
  return rows?.[0]?.count ?? 0;
};
