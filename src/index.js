import app from './app'
import '../config/database'

//ver si heroku asigna otro puerto
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server on port ${port}`)
})