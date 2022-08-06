db.createUser(
    {
        user: "cart",
        pwd: "cart",
        roles: [
            {
                role: "readWrite",
                db: "cart"
            }
        ]
    }
);
db.createCollection("test");