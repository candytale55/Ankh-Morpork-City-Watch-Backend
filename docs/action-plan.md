# Action Plan - Ankh-Morpork City Watch Backend

This plan focuses on completing the backend requirements first, while leaving room for a simple frontend later.

## 1. Define the final project scope

- [ ] Rename the project concept in the README as an Ankh-Morpork City Watch employee/case management API.
- [✔️] Decide the final collections to use:
  - `User`
  - `Case`
- [✔️ ] Decide whether to remove the current `Book` model or replace it with `Case`.
- [✔️] Decide whether to keep `Character` as temporary seed/reference data or remove it once `User` and `Case` are complete.

## 2. Update the data models

- [✔️] Expand the `User` model with the required project fields:
  - `name`
  - `email`
  - `password`
  - `role`
  - `image`
  - `rank`
  - `species`
  - `assignedCases`
- [✔️] Make `role` default to `"user"` and restrict it to `"user"` or `"admin"`.
- [ ] Make `assignedCases` an array of `ObjectId` references to `Case`.
- [✔️] Create a `Case` model with simple fields:
  - `title`
  - `description`
  - `type`
  - `status`
  - `priority`
  - `location`
  - `suspectName`
  - `suspectSpecies`
  - `assignedOfficers`
- [ ] Make `assignedOfficers` an array of `ObjectId` references to `User`.
- [✔️] Use enums only where they help keep data clean, such as `role`, `status`, `priority`, `type`, and `species`.

## 3. Fix authentication

- [ ] Fix the JWT payload so the generated token and auth middleware use the same field name.
- [ ] Import `User` correctly inside the auth middleware.
- [ ] Make the auth middleware attach the logged-in user to `req.user`.
- [ ] Remove sensitive data, especially password, from authenticated user responses.
- [ ] Make protected routes return clear `401 Unauthorized` responses when the token is missing or invalid.

## 4. Add role-based authorization

- [✔️] Create an `isAdmin` middleware.
- [✔️] Allow only admins to:
  - create cases
  - update cases
  - delete cases
  - assign cases to users
  - change user roles
  - delete other users
- [✔️] Allow normal users to:
  - register
  - login
  - view cases
  - create cases (and assign agents)
  - view their own account
  - update their own account, except role
  - delete their own account
- [✔️] Prevent normal users from changing their own role or another user's role.

## 5. Update user registration and profile management

- [✔️] Make registration use Cloudinary upload for the `image` field.
- [ ] Force every registered user to be created with role `"user"`, regardless of what is sent in the request body.
- [ ] Hash passwords before saving users.
- [ ] Avoid returning hashed passwords in API responses.
- [✔️] Add a route for users to update their own profile.
- [✔️] Add an admin-only route to update a user's role.
- [✔️] Delete the user's Cloudinary image when the user account is deleted.

## 6. Build complete user CRUD

- [✔️] `POST /api/v1/users/register` - create user with image upload.
- [✔️] `POST /api/v1/users/login` - login and return token.
- [✔️] `GET /api/v1/users` - admin-only list of users.
- [ ] `GET /api/v1/users/me` - logged-in user's own profile.
- [ ] `GET /api/v1/users/:id` - admin-only user detail, or restrict carefully.
- [✔️] `PUT /api/v1/users/me` - logged-in user updates their own profile.
- [✔️] `PATCH` /api/v1/users/:id/role` - admin-only role update.
- [✔️] `DELETE /api/v1/users/me` - logged-in user deletes their own account.
- [✔️] `DELETE /api/v1/users/:id` - admin-only deletion of another user.

## 7. Build complete case CRUD

- [✔️] `GET /api/v1/cases` - authenticated users can view cases.
- [✔️] `GET /api/v1/cases/:id` - authenticated users can view one case.
- [✔️] `POST /api/v1/cases` - admin / user case creation.
- [ ] `PUT /api/v1/cases/:id` - admin / user case update.
- [✔️] `DELETE /api/v1/cases/:id` - admin-only case deletion.
- [ ] Consider adding `GET /api/v1/cases/my-cases` so normal users can easily see their assigned work.

## 8. Add case assignment logic

- [ ] Create an admin-only route to assign a case to a user.
- [ ] Update both sides of the relationship when assigning:
  - add the case id to `User.assignedCases`
  - add the user id to `Case.assignedOfficers`
- [ ] Use `$addToSet` so duplicate ids are not added.
- [ ] Make sure assigning a new case does not overwrite previous assigned cases.
- [ ] Optionally create an admin-only route to unassign a case from a user using `$pull`.

## 9. Replace or remove old project pieces

- [✔️] WONT Replace `Book` files with `Case` files:
  - model
  - controller
  - routes
  - seed data if needed
- [✔️] Update `index.js` to mount `/api/v1/cases`.
- [ ] Remove unused imports and old routes after the new routes work.
- [✔️] NOPE: CHANGED TO AGENTS - Decide whether `Character` remains part of the final project.
- [✔️] CHANGED TO AGENTS If `Character` stays, make sure it also hascomplete CRUD or clearly document why it exists.

## 10. Add seed data

- [✔️] Create a seed file for the `Case` collection.
- [✔️] Include a small number of simple City Watch assignments, such as:
  - patrol in The Shades
  - missing dragon report
  - guild complaint
  - suspicious clacks message
- [✔️] Add or update the `npm run seed` script.
- [] Make sure the seed can run without breaking required fields.
(validate that agents exist)

## 11. Review Cloudinary behavior

- [✔️] Confirm upload middleware saves user images correctly.
- [✔️] onfirm deleting a user deletes the image from Cloudinary.
- [ ] If user image is updated, delete the previous Cloudinary image after the new one is saved.
- [✔️] Keep Cloudinary folder naming consistent.

## 12. Improve error handling and response shape

- [ ] Return useful status codes:
  - `200` for successful reads/updates
  - `201` for created data
  - `400` for invalid requests
  - `401` for unauthenticated requests
  - `403` for forbidden role actions
  - `404` for missing records
- [ ] Check for missing records before returning successful delete/update responses.
- [ ] Keep response messages simple and consistent.
- [ ] Validate common invalid ids gracefully.

## 13. Document the backend

- [ ] Rewrite the README with:
  - project description
  - technologies used
  - environment variables
  - installation steps
  - seed command
  - available endpoints
  - auth flow
  - role permissions
  - example requests
- [✔️] Explain how the first admin is created manually in MongoAtlas.
- [ ] Explain which routes require a Bearer token.
- [✔️] Explain which routes require admin role.

## 14. Prepare for a simple frontend

- [ ] Keep API responses frontend-friendly and consistent.
- [ ] Make sure login returns:
  - token
  - user id
  - user role
  - user name or email
- [ ] Add simple endpoints that a frontend can use without complex filtering:
  - `GET /api/v1/users/me`
  - `GET /api/v1/cases/my-cases`
  - `GET /api/v1/cases`
- [ ] Avoid backend logic that assumes a frontend framework.
- [ ] Later, create a minimal frontend with:
  - login/register screen
  - profile view
  - cases list
  - admin-only case management view
  - admin-only user role/assignment view

## 15. Manual testing checklist

- [ ] Register a user with image upload.
- [ ] Confirm the user is created with role `"user"`.
- [ ] Login and receive a working token.
- [ ] Use the token on protected routes.
- [ ] Confirm a normal user cannot create/update/delete cases.
- [ ] Confirm a normal user cannot change roles.
- [ ] Manually change one user to admin in MongoAtlas.
- [ ] Confirm admin can create/update/delete cases.
- [ ] Confirm admin can assign a case to a user.
- [ ] Confirm duplicate case assignment is prevented.
- [ ] Confirm previous assigned cases are preserved.
- [ ] Confirm user can delete their own account.
- [ ] Confirm user cannot delete another user's account.
- [ ] Confirm admin can delete another user's account.
- [ ] Confirm Cloudinary images are deleted when users are deleted.

## 16. Final cleanup

- [ ] Remove unused files, routes, imports, and console logs.
- [ ] Check formatting and naming consistency.
- [ ] Confirm `.env` is available for school correction if required.
- [ ] Confirm the repository is public before delivery.
- [ ] Run the app locally and test the main routes before submitting.
