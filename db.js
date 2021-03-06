const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.insertSignatureAndUserId = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_Id)
    VALUES ($1 , $2)
    RETURNING id`,
        [signature, userId]
    );
};

module.exports.getTotalOfSigners = () => {
    const number = `SELECT COUNT(id) 
               FROM signatures`;
    return db.query(number);
};
module.exports.getSignature = (sigId) => {
    return db.query(`SELECT signature FROM signatures WHERE id = ($1)`,[sigId]);
};
module.exports.deleteSignature = (sigId) => {
    return db.query(`DELETE FROM signatures WHERE id = ($1)`, [sigId]);
};

module.exports.insertDetails = (firstName, lastName, emailadress, hashedPW) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING id`,
        [firstName, lastName, emailadress, hashedPW]
    );
};

module.exports.getHashAndIdByEmail = (emailadress) => {
    return db.query(`SELECT password, id FROM users WHERE email = ($1)`, [
        emailadress,
    ]);
};

//do a db query to find out if they've signed: if there is a id, they have signed
module.exports.checkIfSignatureByUserId = (userId) => {
    return db.query(`SELECT id FROM signatures WHERE user_Id = ($1)`, [userId]);
};

module.exports.insertDataUserProfile = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_Id)
    VALUES($1, $2, $3, $4)`,
        [age || null, city || null, url || null, userId]
    );
};

module.exports.getDataForSigners = () => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, signatures.user_id
    FROM users
    JOIN signatures
    ON signatures.user_id = users.id
    JOIN user_profiles
    ON user_profiles.user_id = users.id`
    );
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.url, signatures.user_id
    FROM users
    JOIN signatures
    ON signatures.user_id = users.id
    JOIN user_profiles  
    ON user_profiles.user_id = users.id
    WHERE LOWER(user_profiles.city) = LOWER($1)`,
        [city]
    );
};

module.exports.allCitys = () => {
    return db.query(`SELECT user_profiles.city
    FROM user_profiles
    JOIN signatures
    ON signatures.user_id = user_profiles.user_id`);
};

module.exports.getProfileData = (userId) => {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.url, user_profiles.city
        FROM user_profiles
        LEFT JOIN  users
        ON user_profiles.user_id = users.id 
        WHERE user_profiles.user_id = ($1)`,
        [userId]
    );
};

module.exports.updateUsersWithPassword = (
    firstName,
    lastName,
    email,
    hash,
    userId
) => {
    return db.query(
        `
UPDATE users
SET first =($1), last=($2), email=($3), password=($4)
WHERE id = ($5)`,
        [firstName, lastName, email, hash, userId]
    );
};

module.exports.updateUsersWithoutPassword = (
    firstName,
    lastName,
    email,
    userId
) => {
    return db.query(
        `
UPDATE users
SET first =($1), last=($2), email=($3)
WHERE id = ($4)`,
        [firstName, lastName, email, userId]
    );
};

module.exports.updateUserProfiles = (userId, age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET age = ($2), city = LOWER($3), url = ($4)`,
        [userId, age, city, url]
    );
};
