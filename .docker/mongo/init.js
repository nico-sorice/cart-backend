db.createUser(
    {
        user: "preciosrotos",
        pwd: "preciosrotos",
        roles: [
            {
                role: "readWrite",
                db: "precios"
            }
        ]
    }
);
db.createCollection("test");