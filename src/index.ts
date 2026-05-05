
import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';
import prisma from './lib/prisma'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes)

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTEM', async () => {
    await prisma.$disconnect()
    process.exit(0)
})