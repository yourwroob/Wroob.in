
# PeerUp Rebuild — Wroob Circles

## Overview
Replace the current Campus Feed tab with a new **Wroob Circles** system — ephemeral 24-hour communities where students create meetup sessions, others request to join, and everything auto-expires.

## Database Changes (Migration)

### New Tables:
1. **`peerup_circles`** — The circle/session posts
   - `spot_name`, `spot_location` (e.g. "A-Block · GF")
   - `topic` (discussion topic)
   - `fuel_type` (e.g. "Tea & Coffee")
   - `drop_in_time` (scheduled time)
   - `creator_id`, `created_at`, `expires_at` (auto 24h)
   - `status` (active/expired)

2. **`peerup_requests`** — Join requests
   - `circle_id`, `requester_id`
   - `status` (pending/approved/declined)

3. **`peerup_participants`** — Approved members
   - `circle_id`, `user_id`, `joined_at`

### RLS Policies:
- Authenticated students can view active circles
- Creator can manage their circle's requests
- Participants can view circle details & members

## UI Components (Phase by Phase)

### Phase 1: Create Circle Form
- Fields: Spot Name, Topic, Fuel Type, Drop-in Time (all required)
- Validation, submission, success toast
- Accessible via "+" button in the circles horizontal scroller

### Phase 2: Campus Feed — Circle Discovery
- **Horizontal circle bubbles** at top (like the mockup: AB, LH, CF, + New)
- **Circle cards** below showing active circles with countdown timers
- Auto-refresh, expired circles auto-removed

### Phase 3: Circle Detail View (Modal/Page)
- Shows spot, university, time, location, fuel, topic, countdown
- "Request to spark this Wroob" button for non-members
- "Maybe later" dismiss option

### Phase 4: Request Management (Host View)
- Stats bar: Pending / Approved / Total
- List of pending requests with Decline/Approve buttons
- "Already in" section showing current members
- "Let everyone in" bulk approve

### Phase 5: Active Circle View (Member View)
- "You're in" status with countdown
- Circle details (when, where, fuel, member count)
- Member list with Host badge
- "Navigate to spot" and "Open group chat" buttons

### Phase 6: Community Feed Tab
- Stays as-is (image posts with PostComposer + PostFeed)
- Tab renamed from "Community Feed" to "Drop a Post" per the doc

### Phase 7: Expiry & Cleanup
- Query-level filtering (`expires_at > now()`)
- Enable realtime on new tables for live updates

## Existing Tabs Restructure
- **Tab 1: Campus Feed** → Wroob Circles (create + discover + manage)
- **Tab 2: Drop a Post** → Community Feed (unchanged, just renamed)
- **Tab 3: Local Groups** → Stays as-is

## Design
- Dark theme matching existing platform
- Green accent for active/approved states
- Countdown badges (e.g. "23h left")
- Avatar circles with initials for the horizontal scroller
