import app from './app'
import { port } from './config/config'

app.listen(port, () => {
    console.log(`Server on port ${port}`)
})