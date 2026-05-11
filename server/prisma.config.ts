import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const buildDatabaseUrl = (): string => {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const encodedPassword = encodeURIComponent(DB_PASSWORD || '');
    return `postgresql://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;
};

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: buildDatabaseUrl(),
    },
});
