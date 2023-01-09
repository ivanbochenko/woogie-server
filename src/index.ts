import express from "express"
import cors from 'cors'
import { PrismaClient } from "@prisma/client"
import { auth, generateUploadURL } from './utils'
import { graphQLServer } from './graphQLServer'
import loginRouter from './login'
import feedRouter from './feed'

const prisma = new PrismaClient()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))
app.set('db', prisma) // Access db from routers
app.all('*', auth);

app.use('/login', loginRouter)
app.use('/feed', feedRouter)
app.use('/graphql', graphQLServer)

app.get('/s3url', async (req, res) => {
  const url = await generateUploadURL()
  res.status(200).json(url)
})

app.post('/error', (req, res) => {
  console.log(`Client error: ${req.body}`)
  res.status(200).json({success: true})
})


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
