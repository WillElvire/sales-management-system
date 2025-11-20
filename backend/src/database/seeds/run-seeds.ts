import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Role, RoleName } from '../../modules/roles/entities/role.entity';
import { User, UserStatus } from '../../modules/users/entities/user.entity';

dotenv.config();

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sales_management',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();

  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  console.log('Seeding roles...');
  const existingRoles = await roleRepository.find();
  const rolesToCreate = [
    { name: RoleName.ADMIN, description: 'Administrator' },
    { name: RoleName.COMPTABLE, description: 'Accountant' },
    { name: RoleName.AGENT_COLLECT, description: 'Cash Collect Agent' },
  ].filter(r => !existingRoles.find(er => er.name === r.name));

  const roles = await Promise.all(
    rolesToCreate.map(r => roleRepository.save(roleRepository.create(r)))
  );
  const allRoles = [...existingRoles, ...roles];

  console.log('Seeding admin user...');
  const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const adminRole = allRoles.find(r => r.name === RoleName.ADMIN);
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@salesmanagement.com',
      phone: '+1234567890',
      status: UserStatus.ACTIVE,
      roles: adminRole ? [adminRole] : [],
    });
    await userRepository.save(adminUser);
    console.log('Admin user created: admin / admin123');
  } else {
    console.log('Admin user already exists');
  }

  console.log('Seeds completed!');
  await dataSource.destroy();
}

runSeeds().catch(console.error);

