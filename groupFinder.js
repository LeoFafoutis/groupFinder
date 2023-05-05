//////////////////////////////////////////
/* Create express link and set directoy */
//////////////////////////////////////////

process.stdin.setEncoding("utf8");

const fs = require('fs');
const express = require("express");
const app = express();
const portNumber = 5000;
const path = require("path")
const axios = require('axios');
let groups = [];
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(bodyParser.urlencoded({ extended: true }));

const MONGO_DB_USERNAME = "exampleUser"
const MONGO_DB_PASSWORD = "trr4Igh01oc6hGqA"
const MONGO_DB_NAME = "finalD"
const MONGO_COLLECTION = "groupName"

const userName = MONGO_DB_USERNAME;
const password = MONGO_DB_PASSWORD;
const databaseAndCollection = { db: MONGO_DB_NAME, collection: MONGO_COLLECTION };
const uri = `mongodb+srv://${userName}:${password}@cluster0.y9wwuu4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(`Web server started and running at http://localhost:5000/`);

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

////////////////////////
/* Serve Diffrnt page */
////////////////////////

app.get("/", (req, res) => {
  res.render("index", { title: "Group Finder" });
});

app.use(express.urlencoded({ extended: true }));

function getGroupElements() {
  if (groups.length === 0) {
    return '';
  } else {
    return groups.map(group => `
        <div class="container">
          <div class="content">
            <div class="group-name">${group.groupName}</div>
            <div class="location">${group.location}</div>
            <div class="members-course">
              <div class="members">
                <div class="number">${group.numMembers}</div>
                <div class="label">Members</div>
              </div>
              <div class="course">
                <div class="number">${group.course}</div>
                <div class="label">Course</div>
              </div>
            </div>
            <button class="join-btn">Join</button>
          </div>
        </div>
      `).join('<br>');
  }
}

app.get('/home', async (req, res) => {
  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);

    groups = await cursor.toArray();
    const groupElements = getGroupElements();
    res.render('home.ejs', { groupElements });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.post('/home', async (req, res) => {
  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);

    groups = await cursor.toArray();
    const groupElements = getGroupElements();
    res.render('home.ejs', { groupElements });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.get('/createGroup', async (req, res) => {

  const { data: courses } = await axios.get('https://api.umd.io/v1/courses', {
    params: {
      dept_id: 'CMSC'
    }
  });
  const items = courses.map(course => `<option value="${course.course_id}">${course.course_id} - ${course.name}</option>`);
  res.render('createGroup.ejs', { items });
});


app.post('/createGroup', async (req, res) => {
  try {
    await client.connect();
    let group1 = {
      groupName: req.body.groupName,
      location: req.body.location,
      numMembers: req.body.numMembers,
      course: req.body.course
    };
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(group1);
    res.redirect("/home")
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.get('/groupChat', (req, res) => {
  res.render("groupChat");
});

app.listen(portNumber);

