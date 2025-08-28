import { rembaseInitSync } from "rembase-web";


export const rembaseApp = rembaseInitSync(import.meta.env.VITE_APP_ID,import.meta.env.VITE_PROJ_Id,"asia-1")
