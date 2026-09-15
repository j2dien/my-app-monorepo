import { db } from '../db'
import {
    appMetadata,
    users,
} from '../db/schema'

export async function cleanupDatabase() {
    // Urutkan child table sebelum parent table
    // saat nanti sudah ada foreign key.
    await db.delete(users)
    await db.delete(appMetadata)
}