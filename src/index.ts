import express from "express"
import cors from 'cors'
import util from 'util'
import multer, { memoryStorage } from "multer"
import { graphQLServer } from './graphQLServer'
import loginRouter from './routes/login'
import devRouter from './routes/dev'
import imagesRouter from './routes/images'
import { verifyToken } from "./utils/token"
import * as nsfw from 'nsfwjs'

const app = express()
const port = process.env.PORT || 3000

const storage = memoryStorage()
const upload = multer({ storage }).single('file')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/html" }))

const load_model = async () => {
  const model = await nsfw.load()
  app.set('model', model)
}

if(process.env.NODE_ENV === 'dev') {
  app.use(
    '/dev',
    // upload,
    devRouter
  )
} else {
  app.all('*', (req, res, next) => {
    try {
      if (
        req.path === '/error'  ||
        req.path.startsWith('/login')
      ) return next();
      const token = req.headers['authorization']!
      const { id, email } = verifyToken(token)
      app.set('user_id', id)
      app.set('email', email)
      next()
    } catch (error) {
      res.status(401).json('Authorization error')
      console.error(error)
    }
  })
}

app.use('/graphql', graphQLServer)
app.use('/login', loginRouter)
app.use('/images', upload, imagesRouter)

app.post('/error', (req, res) => {
  console.log('Client error: ' + util.inspect(req.body, false, null, true ))
  res.status(200).json({success: true})
})

load_model().then(() => 
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })
)


