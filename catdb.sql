
CREATE TABLE users (
                user_id INTEGER NOT NULL,
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                user_url VARCHAR NOT NULL,
                avatar_url VARCHAR NOT NULL,
                CONSTRAINT users_pk PRIMARY KEY (user_id)
);


CREATE TABLE category (
                category_id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                CONSTRAINT category_pk PRIMARY KEY (category_id)
);


CREATE TABLE image (
                image_id VARCHAR NOT NULL,
                url VARCHAR NOT NULL,
                height NUMERIC NOT NULL,
                width NUMERIC NOT NULL,
                CONSTRAINT image_pk PRIMARY KEY (image_id)
);


CREATE TABLE image_category (
                category_id VARCHAR NOT NULL,
                image_id VARCHAR NOT NULL
);


CREATE TABLE breed (
                breed_id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                temperament VARCHAR NOT NULL,
                life_span VARCHAR NOT NULL,
                wikipedia_url VARCHAR NOT NULL,
                origin VARCHAR NOT NULL,
                CONSTRAINT breed_pk PRIMARY KEY (breed_id)
);


CREATE TABLE image_breed (
                breed_id VARCHAR NOT NULL,
                image_id VARCHAR NOT NULL
);


ALTER TABLE image_category ADD CONSTRAINT category_image_category_fk
FOREIGN KEY (category_id)
REFERENCES category (category_id)
ON DELETE CASCADE
ON UPDATE CASCADE
NOT DEFERRABLE;

ALTER TABLE image_category ADD CONSTRAINT image_image_category_fk
FOREIGN KEY (image_id)
REFERENCES image (image_id)
ON DELETE CASCADE
ON UPDATE CASCADE
NOT DEFERRABLE;

ALTER TABLE image_breed ADD CONSTRAINT image_image_breed_fk
FOREIGN KEY (image_id)
REFERENCES image (image_id)
ON DELETE CASCADE
ON UPDATE CASCADE
NOT DEFERRABLE;

ALTER TABLE image_breed ADD CONSTRAINT breed_image_breed_fk
FOREIGN KEY (breed_id)
REFERENCES breed (breed_id)
ON DELETE CASCADE
ON UPDATE CASCADE
NOT DEFERRABLE;
