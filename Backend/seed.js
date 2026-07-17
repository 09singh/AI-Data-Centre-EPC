import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './scr/Features/auth/model.js'
import { env } from './scr/config/env.js'

const seedUsers = async () => {
  try {
    await mongoose.connect(env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    // Delete existing users
    await User.deleteMany({})
    
    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'Admin',
        companyName: 'EPC Solutions',
        projectName: 'Riverbend Data Centre'
      },
      {
        name: 'Project Manager',
        email: 'pm@example.com',
        password: await bcrypt.hash('pm123', 10),
        role: 'Project Manager',
        companyName: 'EPC Solutions',
        projectName: 'Riverbend Data Centre'
      },
      {
        name: 'Engineer User',
        email: 'engineer@example.com',
        password: await bcrypt.hash('eng123', 10),
        role: 'Engineer',
        companyName: 'EPC Solutions',
        projectName: 'Riverbend Data Centre'
      },
      {
        name: 'QA User',
        email: 'qa@example.com',
        password: await bcrypt.hash('qa123', 10),
        role: 'QA',
        companyName: 'EPC Solutions',
        projectName: 'Riverbend Data Centre'
      }
    ]
    
    await User.insertMany(users)
    console.log('✅ Test users created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('  👤 Admin: admin@example.com / admin123')
    console.log('  👤 PM: pm@example.com / pm123')
    console.log('  👤 Engineer: engineer@example.com / eng123')
    console.log('  👤 QA: qa@example.com / qa123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  }
}

seedUsers()