# SheServes Admin Credentials

## Login Details

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| Password | `sheserves2025` |

## Notes

- Login page: `http://localhost:4200/login`
- Credentials are stored in MongoDB `SheServesTC` database, `users` collection, with a bcrypt-hashed password.
- To create the admin user (first time only): run `npm run seed` inside `c:/Projects2/SheServes/api/`
- To change the password, update `seed.js` and re-run `npm run seed` after removing the existing user from MongoDB.
