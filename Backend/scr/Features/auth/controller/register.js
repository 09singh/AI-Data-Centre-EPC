import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../../config/env.js'
import User from '../model.js'

export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, projectName } = req.body
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Project Manager',
      companyName,
      projectName
    })
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        projectName: user.projectName
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}