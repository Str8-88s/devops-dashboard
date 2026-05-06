
import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';
import prisma from './lib/prisma'
import authRoutes from './routes/auth.routes'
import cors from 'cors'
import cookieParser from 'cookie-parser';



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)


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