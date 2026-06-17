# Database Migration Sequence

To ensure the Culinara database schema is correctly set up with all production hardening and performance optimizations, run the following SQL migrations in order in your Supabase SQL Editor.

### 1. `0000_init.sql`
**Purpose:** Sets up the core foundation.
- Creates `profiles`, `recipes`, and `recipe_versions` tables.
- Establishes foreign key relationships and versioning pointers.
- Enables Row Level Security (RLS) and base policies for ownership.
- **Includes:** Composite unique constraint on versions to prevent corruption.

### 2. `0001_add_profile_prefs.sql`
**Purpose:** Extends the user profile.
- Adds `dietary_goals` and `serving_default` columns.
- **Includes:** Database-level check to ensure `serving_default` is always positive.

### 3. `0001_mvp_fixes.sql`
**Purpose:** Critical schema updates for the extraction pipeline.
- Declares the `source` (youtube/pantry) and `original_pantry_input` columns.
- Makes `original_url` nullable to support Pantry-only recipes.
- Adds strict source validation constraints.
- Adds a status enum check (`processing`, `completed`, `failed`).

### 4. `0002_fix_profile_rls.sql`
**Purpose:** Hardens security and ensures app functionality.
- Explicitly allows users to `INSERT` and `SELECT` their own profile records.
- Fixes the bug where the server-side profile creation would fail under strict RLS.

### 5. `0003_add_recipe_source.sql`
**Purpose:** Maintenance & Documentation.
- (Self-cleaning migration): Verified that source columns are correctly registered in the schema.

### 6. `0004_fix_pantry_persistence.sql`
**Purpose:** Final performance & integrity sweep.
- Consolidates redundant constraints.
- Replaces basic indexes with high-performance **DESC (Descending)** indexes for faster data retrieval of recently saved recipes.
- Drops obsolete indexes to reduce storage overhead.

---

### **Verification**
After running these, your schema will support:
- [x] 4-Tier Extraction (Transcript fallback).
- [x] Multi-version recipe edits.
- [x] Secure owner-only access.
- [x] High-performance dashboard queries.
