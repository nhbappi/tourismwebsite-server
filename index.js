const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ajasr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
 try{
     const bookingOptionCollection = client.db('tourismAgency').collection('bookingOption');
     const bookingsCollection = client.db('tourismAgency').collection('booking');
     const usersCollection = client.db('tourismAgency').collection('users');
     const tourCollection = client.db('tourismAgency').collection('tour');
     
     app.get('/bookingOption', async(req, res) =>{
        const date = req.query.date;
        const query = {};
        const options = await bookingOptionCollection.find(query).toArray();
        const bookingQuery = {bookingDate: date}
        const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
        options.forEach(option => {
            const optionBooked = alreadyBooked.filter(book => book.booking === option.name);
            const bookedSlots = optionBooked.map(book => book.slot);
            const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
            option.slots = remainingSlots;
           
        })
        res.send(options);
     });


     app.get('/booking', async (req, res) => {
        const email = req.query.email;
console.log(email)
        const query = { email: email };
        const bookings = await bookingsCollection.find(query).toArray();
        res.send(bookings);
    });



     app.post('/booking', async(req, res) =>{
        const booking = req.body;
        const query = {
            bookingDate: booking.bookingDate,
            email: booking.email,
            books: booking.books
        }

        const alreadyBooked = await bookingsCollection.find(query).toArray();
        if(alreadyBooked.length){
            const message = `You already have a booking on ${booking.bookingDate}`
            return res.send({acknowledged: false, message})
        }

        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
     });

     app.get('/users', async (req, res) => {
        const query = {};
        const users = await usersCollection.find(query).toArray();
        res.send(users);
    });



    app.get('/tourSpecialty', async (req, res) => {
        const query = {}
        const result = await bookingsCollection.find(query).project({ name: 1 }).toArray();
        res.send(result);
    })




    app.put('/makeAdmin'), async (req, res) => {
        const user = req.body;
        console.log(user)
        const filter = { email: user.email };
        const findUser = await usersCollection.find(filter).toArray();
        if (findUser) {
            const UserDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, UserDoc);
            res.json(result)
        }

    }
    // app.get('/users/admin/:email', async (req, res) => {
    //     const email = req.params.email;
    //     const query = { email }
    //     const user = await usersCollection.findOne(query);
    //     res.send({ isAdmin: user?.role === 'admin' });
    // })




     app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);

     });
     app.get('/tour', async (req, res) => {
        const query = {};
        const tour = await tourCollection.find(query).toArray();
        res.send(tour);
    })

     app.post('/tour', async(req, res) =>{
        const tour = req.body;
            const result = await tourCollection.insertOne(tour);
            res.send(result);

     })
    //  app.delete('/tour/:id',  async (req, res) => {
    //     const id = req.params.id;
    //     const filter = { _id: ObjectId(id) };
    //     const result = await tourCollection.deleteOne(filter);
    //     res.send(result);
    // })

 }
 finally{

 }
}
run().catch(console.log);





app.get('/', async(req, res) =>{
    res.send('Tourism portal is running');
})

app.listen(port, () => console.log(`tourism portal is running on ${port}`))
