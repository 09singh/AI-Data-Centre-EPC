import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../../../config/env.js'
import User from '../model.js'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user from database
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
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