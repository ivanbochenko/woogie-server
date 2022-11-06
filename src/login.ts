import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const router = express.Router()

router.post('/password', async (req, res) => {
  const { name, password } = req.body;
  if (name === process.env.ADMIN_NAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({
      id: 1,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // Valid for 30 days
    }, process.env.JWT_SECRET ?? '', { algorithm: 'HS256' })
    res.status(200).json({token, id: 1, success: true})
  } else {
    res.status(200).json({success: false})
  }
})

// Create new user with facebook email

router.post('/facebook', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { code, verifier } = req.body;
    const email = await getFacebookEmail(code, verifier)
    const user = await prisma.user.upsert({
      where: { email },
      update: { email },
      create: { email },
    })
    const id = user.id
    // Create JWT
    const token = jwt.sign({
      id,
      email,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // Valid for 30 days
    }, process.env.JWT_SECRET ?? '', { algorithm: 'HS256' })
    res.status(200).json({token, id})
  } catch (error) {
    res.status(500).json(error)
    console.log(error)
  }
})

export default router;

const getFacebookEmail = async (code: string, verifier: string) => {
  const link =
  "https://graph.facebook.com/oauth/access_token" +
  "?client_id=" + process.env.FACEBOOK_CLIENT_ID +
  "&redirect_uri=https://auth.expo.io/@" + process.env.EXPO_SLUG +
  "&client_secret=" + process.env.FACEBOOK_CLIENT_SECRET +
  "&grant_type=authorization_code" + 
  "&code_verifier=" + verifier +
  "&code=" + code;

  const { data: res } = await axios.get(link)
  const { data } = await axios.post(`https://graph.facebook.com/v14.0/me?fields=email&access_token=${res.access_token}`)

  return data.email
}