#!/usr/bin/env bash
# Seed script — creates an admin user and populates events
set -euo pipefail

API="http://localhost:8080/api"

echo "==> Registering seed user..."
TOKEN=$(curl -sf -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"seed@kulto.dev","password":"seedpass123","displayName":"Kulto Admin"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null) \
|| TOKEN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seed@kulto.dev","password":"seedpass123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "==> Got token, creating events..."

create_event() {
  curl -sf -X POST "$API/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$1" > /dev/null
  echo "  + $(echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")"
}

# ── Cinema ──
create_event '{
  "title": "Nosferatu (2024)",
  "description": "Robert Eggers reimagines the gothic horror classic. A young woman is haunted by an ancient vampire.",
  "category": "CINEMA",
  "date": "2026-04-05T20:30:00",
  "venue": "MK2 Bibliothèque",
  "city": "Paris",
  "tags": ["horror", "gothic", "eggers"]
}'

create_event '{
  "title": "Past Lives — Ciné-club",
  "description": "Celine Song'\''s debut about childhood friends reunited decades later in New York.",
  "category": "CINEMA",
  "date": "2026-04-08T19:00:00",
  "venue": "Le Champo",
  "city": "Paris",
  "tags": ["drama", "romance", "A24"]
}'

create_event '{
  "title": "Akira — 4K Restoration",
  "description": "Katsuhiro Otomo'\''s cyberpunk masterpiece returns to the big screen in 4K.",
  "category": "CINEMA",
  "date": "2026-04-12T21:00:00",
  "venue": "La Cinémathèque française",
  "city": "Paris",
  "tags": ["anime", "cyberpunk", "classic"]
}'

# ── Concerts ──
create_event '{
  "title": "Floating Points — Live",
  "description": "Sam Shepherd brings his genre-defying electronic/jazz live set to La Gaîté.",
  "category": "CONCERT",
  "date": "2026-04-10T20:00:00",
  "venue": "La Gaîté Lyrique",
  "city": "Paris",
  "tags": ["electronic", "jazz", "live"]
}'

create_event '{
  "title": "Pomme — Consolation Tour",
  "description": "The folk singer-songwriter performs songs from her latest album.",
  "category": "CONCERT",
  "date": "2026-04-15T20:30:00",
  "venue": "L'\''Olympia",
  "city": "Paris",
  "tags": ["folk", "french", "singer-songwriter"]
}'

create_event '{
  "title": "Nils Frahm — Solo Piano",
  "description": "The German pianist and composer performs an intimate solo piano set.",
  "category": "CONCERT",
  "date": "2026-04-18T21:00:00",
  "venue": "Philharmonie de Paris",
  "city": "Paris",
  "tags": ["piano", "neoclassical", "ambient"]
}'

# ── Exhibitions ──
create_event '{
  "title": "Basquiat × Warhol. À quatre mains",
  "description": "Over 300 collaborative works exploring the creative dialogue between two icons.",
  "category": "EXHIBITION",
  "date": "2026-04-06T10:00:00",
  "venue": "Fondation Louis Vuitton",
  "city": "Paris",
  "tags": ["contemporary", "pop-art", "painting"]
}'

create_event '{
  "title": "Anselm Kiefer — Fallen Angels",
  "description": "Monumental installations exploring myth, memory and destruction.",
  "category": "EXHIBITION",
  "date": "2026-04-09T11:00:00",
  "venue": "Grand Palais",
  "city": "Paris",
  "tags": ["contemporary", "installation", "sculpture"]
}'

create_event '{
  "title": "World Press Photo 2026",
  "description": "The year'\''s most powerful photojournalism, exhibited in a historic church.",
  "category": "EXHIBITION",
  "date": "2026-04-20T10:00:00",
  "venue": "Église des Célestins",
  "city": "Lyon",
  "tags": ["photography", "journalism", "documentary"]
}'

# ── Theatre ──
create_event '{
  "title": "Le Tartuffe — Ivo van Hove",
  "description": "Ivo van Hove'\''s radical staging of Molière'\''s comedy about hypocrisy.",
  "category": "THEATRE",
  "date": "2026-04-11T19:30:00",
  "venue": "Odéon – Théâtre de l'\''Europe",
  "city": "Paris",
  "tags": ["moliere", "comedy", "van-hove"]
}'

create_event '{
  "title": "Roméo et Juliette — Ballet de l'\''Opéra",
  "description": "Prokofiev'\''s score performed by the Ballet de l'\''Opéra national de Paris.",
  "category": "THEATRE",
  "date": "2026-04-14T19:00:00",
  "venue": "Opéra Bastille",
  "city": "Paris",
  "tags": ["ballet", "classical", "prokofiev"]
}'

# ── Festival ──
create_event '{
  "title": "Villette Sonique 2026",
  "description": "Free open-air festival mixing indie rock, electronic and experimental acts.",
  "category": "FESTIVAL",
  "date": "2026-04-25T14:00:00",
  "venue": "Parc de la Villette",
  "city": "Paris",
  "tags": ["indie", "electronic", "free", "outdoor"]
}'

create_event '{
  "title": "Nuit des Musées",
  "description": "Museums open their doors for free after dark — special performances and installations.",
  "category": "FESTIVAL",
  "date": "2026-05-16T18:00:00",
  "venue": "Multiple venues",
  "city": "Paris",
  "tags": ["museum", "free", "night", "culture"]
}'

echo ""
echo "==> Done! Seeded 13 events."
