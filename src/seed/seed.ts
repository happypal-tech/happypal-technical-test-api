import bcrypt from 'bcrypt';
import { encode } from 'blurhash';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createConnection, getConnection } from 'typeorm';

import { Picture } from '@/picture/models/picture.model';
import { Product } from '@/product/models/product.model';
import { User } from '@/user/models/user.model';
import { Brand } from '@/brand/models/brand.model';

async function seed() {
  console.log('Seeding started');

  await createTypeormConnection();

  const pictures = await importPictures();
  const brands: Brand[] = [];
  const products: Product[] = [];
  const users: User[] = [];

  const password = await hashPassword('password');

  brands.push(
    new Brand({
      name: 'Adidas'
    })
  );

  brands.push(
    new Brand({
      name: 'Decathlon'
    })
  );

  brands.push(
    new Brand({
      name: 'Leclerc'
    })
  );

  users.push(
    new User({
      email: 'user1@test.com',
      password,
    }),
  );

  users.push(
    new User({
      email: 'user2@test.com',
      password,
    }),
  );

  users.push(
    new User({
      email: 'user3@test.com',
      password,
    }),
  );

  products.push(
    new Product({
      name: 'Vélo de route',
      description: 'Un vélo de route noir',
      owner: users[0],
      pictures: [pictures['bike.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 150000,
      brand: brands[0],
    }),
  );

  products.push(
    new Product({
      name: 'Voiture miniature',
      description: 'Une jolie petit voiture',
      owner: users[0],
      pictures: [pictures['car-model.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 1500,
      brand: brands[1],
    }),
  );

  products.push(
    new Product({
      name: 'Chanel numéro 5',
      description: 'Un parfum exceptionnel',
      owner: users[1],
      pictures: [pictures['chanel.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 66600,
      brand: brands[2],
    }),
  );

  products.push(
    new Product({
      name: 'Une poche de café',
      description: 'Le carburant des dev',
      owner: users[1],
      pictures: [pictures['coffee.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 1500,
      brand: brands[0],
    }),
  );

  products.push(
    new Product({
      name: 'Manette de jeu',
      description: 'Et oui il existe des joueurs manettes ne les oublions pas',
      owner: users[1],
      pictures: [pictures['controller.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 3500,
      brand: brands[0],
    }),
  );

  products.push(
    new Product({
      name: 'Lunettes de soleil',
      owner: users[0],
      pictures: [pictures['glasses.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 6000,
      brand: brands[1],
    }),
  );

  products.push(
    new Product({
      name: 'Casque audio',
      owner: users[0],
      pictures: [pictures['headphones.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 12000,
      brand: brands[2],
    }),
  );

  products.push(
    new Product({
      name: 'Rouge à lèvres',
      owner: users[0],
      pictures: [pictures['lipstick.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 2450,
      brand: brands[0],
    }),
  );

  products.push(
    new Product({
      name: 'Chaussres de sport',
      owner: users[0],
      pictures: [pictures['shoe.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 9999,
      brand: brands[0],
    }),
  );

  products.push(
    new Product({
      name: 'Une montre connectée',
      description: "Avoir l'heure depuis internet c'est mieux non ?",
      owner: users[1],
      pictures: [pictures['watch-1.jpeg'], pictures['watch-2.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 25000,
      brand: brands[2],
    }),
  );

  products.push(
    new Product({
      name: "De l'eau est briquette",
      owner: users[1],
      pictures: [pictures['water.jpeg']],
      priceCurrency: 'EUR',
      priceValue: 250,
      brand: brands[0],
    }),
  );

  let hasPictureError = false;

  products.forEach((product) => {
    if (product.pictures.length !== product.pictures.filter(Boolean).length) {
      console.error('Product picture failing', product);
      hasPictureError = true;
    }
  });

  if (hasPictureError) {
    console.log('Seeding failed');
    return;
  }

  await getConnection().transaction(async (manager) => {
    await manager.upsert(Brand, brands, ['name']);
    await manager.upsert(User, users, ['email']);
    await manager.upsert(Product, products, ['name']);
  });

  console.log('Seeding completed');
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function importPictures(): Promise<Record<string, Picture>> {
  const files = fs.readdirSync(path.resolve(__dirname, 'pictures'), {
    withFileTypes: true,
  });

  const pictures = await Promise.all(
    files
      .filter((file) => file.isFile)
      .map((file) => processPicture(file.name)),
  );

  const dict: Record<string, Picture> = {};

  pictures.forEach((picture) => {
    dict[picture.originalName as string] = picture;
  });

  return dict;
}

async function processPicture(fileName: string) {
  const file = fs.readFileSync(path.resolve(__dirname, 'pictures', fileName));

  if (!file) {
    throw new Error(`${file} not found`);
  }

  const pipeline = sharp(file);

  const [{ data, info }, hash] = await Promise.all([
    pipeline.ensureAlpha().webp().toBuffer({ resolveWithObject: true }),
    generateHash(pipeline),
  ]);

  const picture = new Picture({
    originalName: fileName,
    mimetype: `image/${info.format}`,
    size: info.size,
    width: info.width,
    height: info.height,
    hash,
  });

  await getConnection().transaction(async (manager) => {
    await manager.save(picture);

    fs.mkdirSync('uploads/pictures', { recursive: true });
    fs.writeFileSync(`uploads/pictures/${picture.id}.webp`, data);
  });

  return picture;
}

async function generateHash(pipeline: sharp.Sharp) {
  const { data, info } = await pipeline
    .clone()
    .ensureAlpha()
    .raw()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function createTypeormConnection() {
  return createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    database: 'happypal_technical_test',
    username: 'hpal',
    password: 'hpal',
    entities: [path.join(__dirname, '..', '**/*.model{.ts,.js}')],
    migrations: [path.join(__dirname, '..', 'migrations/**{.ts,.js}')],
    synchronize: true,
  });
}

seed();
