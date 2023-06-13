if(document.getElementById('load')){
  document.getElementById('load').style.visibility = 'hidden'
}

//firebase settings
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword , signOut } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, update , ref, set , onValue} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyATlJZcDRI_KQSnPVInL1C3nXAldRbBPnw",
  authDomain: "quickquiz-90257.firebaseapp.com",
  projectId: "quickquiz-90257",
  storageBucket: "quickquiz-90257.appspot.com",
  messagingSenderId: "1044364199701",
  appId: "1:1044364199701:web:50ad4874a1cb9a2625cb1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
var user = auth.currentUser;
var Unique_ID

//getting buttons
const createBtn = document.getElementById('create')
const loginBtn = document.getElementById('Login')
const logoutBtn = document.getElementById('logout')

if(createBtn){
  createBtn.addEventListener('click',function(){
    afterOnClick()
    var email = document.getElementById('email').value
    var name = document.getElementById('name').value
    var username= document.getElementById('username').value
    var password = document.getElementById('password').value
    var cpassword = document.getElementById('confirm_password').value
    if(password!=cpassword){
      alert('Password & Confirm Password must be same.')
    }
    else{ 
    createUserWithEmailAndPassword(auth, email, cpassword)
    .then((userCredential) => {
      const user = userCredential.user;
      Unique_ID = user.uid
      localStorage.setItem("uid" , Unique_ID)
      set(ref(database, 'Users/' + user.uid), {
        Name : name,
        Email : email,
        Username : username,
        Unique_ID : user.uid,
        Previous_Score : 0,
        Highest_Score : 0
      })
      .then(() => {
        onSuccess()
        alert('Account Created Successfully')
        window.location.href = 'index.html'
      })
      .catch((error) => {
        onSuccess()
        console.error(error);
      });
    })
    .catch((error) => {
      onSuccess()
      console.log(error)
    });
    }
    })
    
}

//login user 

if(loginBtn){
  loginBtn.addEventListener('click',function(){
    afterOnClick()
    var email = document.getElementById('user').value
    var password = document.getElementById('pass').value
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      Unique_ID = user.uid
      localStorage.setItem("uid" , Unique_ID)
      onSuccess()
      alert('Login Successful')
      window.location.href= 'QuizPage.html'
    })
    .catch((error) => {
      console.log(error)
      onSuccess()
    });
    })
}


//logout

if(logoutBtn){
  logoutBtn.addEventListener('click',function(){
    signOut(auth).then(() => {
      alert('Logout Successful.')
      window.location.href = 'index.html'
    }).catch((error) => {
      console.log(error)
    });
  })
}


//hide n unhide buttons

function afterOnClick(){
  var loader = document.getElementById('load')
  loader.style.visibility = 'visible'
  if(document.getElementById('Login')){
    document.getElementById('Login').style.disabled = 'true'
    loginBtn.style.cursor = "not-allowed"
  }
  if(document.getElementById('create')){
    document.getElementById('create').style.disabled = 'true'
    createBtn.style.cursor = "wait"
  }
}

function onSuccess(){
  var loader = document.getElementById('load')
  loader.style.visibility = 'hidden'
  
  if(document.getElementById('Login')){
    document.getElementById('Login').style.disabled = 'false'
    loginBtn.style.cursor = "pointer"
  }
  if(document.getElementById('create')){
    document.getElementById('create').style.disabled = 'true'
    createBtn.style.cursor = "pointer"
  }
}


//QuizGame


function Quiz(questions) {
    this.score = 0;
    this.questions = questions;
    this.questionIndex = 0;
}


Quiz.prototype.getQuestionIndex = function() {
    return this.questions[this.questionIndex];
}


function ra(){
  return Math.floor(Math.random() * (9-1) + 1);
}
var count=0
var rl=[0,];
var rn=0;
Quiz.prototype.guess = function(answer) {
  if(this.getQuestionIndex().isCorrectAnswer(answer)){
      
      this.score++;
  }
  rn = ra();
  while(rl.includes(rn)){
    rn=ra();
    
  }
  this.questionIndex=rn;
  count+=1
  rl.push(rn);
}


Quiz.prototype.isEnded = function() {
    return count == 5 
}

function Question(text, choices, answer) {
    this.text = text;
    this.choices = choices;
    this.answer = answer;
}

Question.prototype.isCorrectAnswer = function(choice) {
    if(this.answer===choice){

    }
    return this.answer === choice;
}

function populate() {
    if(quiz.isEnded()) {
        showScores();
    }
    else {
        // show question
        var element = document.getElementById("question");
        element.innerHTML = quiz.getQuestionIndex().text;
        // show options
        var choices = quiz.getQuestionIndex().choices;
        for(var i = 0; i < choices.length; i++) {
            var element = document.getElementById("choice" + i);
            element.innerHTML = choices[i];
            guess("btn" + i, choices[i]);
        }
        showProgress();
    }
};

function guess(id, guess) {
    var button = document.getElementById(id);
    button.onclick = function() {
        quiz.guess(guess);
        populate();
    }
};


function showProgress() {
    var element = document.getElementById("progress");
    element.innerHTML = "Question " + (count+1) + " of " + 5;
};

var previous
var highest

//getting previous score
function getData() {
  console.log(localStorage.getItem("uid"))
  const starCountRef = ref(database, 'Users/' + localStorage.getItem("uid") + "/Previous_Score");
  const highestScore = ref(database, 'Users/' + localStorage.getItem("uid") + "/Highest_Score");
  onValue(starCountRef, (snapshot) => {
      previous = snapshot.val();
      localStorage.setItem("previous", previous)
  });

  onValue(highestScore, (snapshot) => {
    highest = snapshot.val();
    localStorage.setItem("highest", highest)
});
}


function showScores() {
    
    getData()
    
    var gameOverHTML = "<h1>Result</h1>";
    const final_score = quiz.score*10
    gameOverHTML += "<h2 id='score'> Current scores: " + quiz.score*10 + "</h2><br><br><br>" + "<h3 id='previous_score'>Previous Score : "+ localStorage.getItem("previous") +"</h3><br><br><br>" + "<h3 id='highest_score'>Highest Score : "+ localStorage.getItem("highest") +"</h3>" ;
    var element = document.getElementById("quiz");
    element.innerHTML = gameOverHTML;

    if(final_score>localStorage.getItem("highest")){ 
      update(ref(database, 'Users/' + localStorage.getItem("uid")), {
        Previous_Score : final_score,
        Highest_Score : final_score
      })
      .then(() => {
        alert('Updated')
        
      })
      .catch((error) => {
        console.error(error);
      });
    }

    else{ 
    update(ref(database, 'Users/' + localStorage.getItem("uid")), {
      Previous_Score : final_score
    })
    .then(() => {
      alert('Updated')
      
    })
    .catch((error) => {
      console.error(error);
    });
    }
}


//getting category button 
var geographyFun = document.getElementById('geographyFun')
var GK = document.getElementById('GK')
var sports = document.getElementById('sports')
var history = document.getElementById('history')
var music = document.getElementById('music')
var food = document.getElementById('food')
var science = document.getElementById('science')
var wordPlay = document.getElementById('wordPlay')
var computer = document.getElementById('computer')
var potLuck = document.getElementById('potLuck')


//timer
var sec = 30;
var time
function myTimer() {
    const timerr = document.getElementById('timer')
    if(timerr){ 
    timerr.innerHTML = "Time : " + sec + " sec left";
    sec--;
    if (sec == -1) {
        clearInterval(time);
        alert("Time out!!");
        showScores()
    }
}
}
//questions

var quiz;
var questions = []


if(geographyFun){ 
    geographyFun.addEventListener('click', function() {
      questions = [
        new Question("Which is the coldest continent in the world?", ["Europe","Oceania","Africa","Antartica"], "Antartica"),
        new Question("Which is the world's smallest country?", ["South Sudan","Bhutan","Samoan Islands","Vatican City"], "Vatican"),
        new Question("How many countries are present in Africa?", ["12","54","4","78"], "54"),
        new Question("Which planet is closest to Planet Earth?", ["Mars","Venus","Mercury","Uranus"], "Venus"),
        new Question("What is the name the river that is not crossed by any bridges.", ["Amazon","Nile","Yamuna","Bhagirathi"], "Amazon"),
        new Question("Which of the following geographical term related to a body of land surrounded by water on three sides?", ["Peninsula","Delta","Mountain","Island"], "Peninsula"),
        new Question("Which of the following minerals is found only in Madhya Pradesh?", ["Thyrodium","Diamond","Iron","Mica"], "Diamond"),
        new Question("The United States consists of how many states?", ["54","50","63","99"], "50"),
        new Question("Which continent is known as Dark Continent?", ["Oceania","Africa","South America","Europe"], "Africa"),
        new Question("What is the name of the supercontinent that existed 200 million years ago?", ["Devoo","SuperAsia","Greater India","Pangea"], "Pangea"),
];
    quiz = new Quiz(questions);
    populate();
})
}

if(GK){
    GK.addEventListener('click',function(){
    // create questions here
    questions = [
    new Question("Who was the first President of India?", ["Abdul Kalam","Lal Barhadur Shastri","Dr.Rajendra Prasad","Zakir hussain"], "Dr.Rajendra Prasad"),
    new Question("Who was the first Indian Scientist to win a Nobel Prize?", ["C.V Raman"," Amartya Sen","Hargobind Khorana","Subramanian Chrandrashekar"], "C.V Raman"),
    new Question("Who built the Jama Masjid?",[" Jahangir","Akbar","Imam Bukhari"," Shah Jahan"],"Shah Jahan"),
    new Question("Who was the first Indian to go to space?",[" Vikram Ambalal","Ravish Malhotra","Rakesh Sharma","Nagapathi Bhat"],"Rakesh  Sharma"),
    new Question("Which among the following was the first Indian woman who went into space?",["Kalpana Chawla","Sunita Williams","Koneru Humpy","None of the above"],"Kalpana Chawala"),
    new Question("The chief constituent of gobar gas is?",["ethane","methane","hydrogen","carbon dioxide"],"methane"),
    new Question("The 2006 World Cup Football Tournament held   in?",["France","China","Germany","Brazil"],"Germany"),
    new Question("Satellite launching station is located at?",["Sriharikotta (Andhra Pradesh)","Solapur(Maharashtra)","Salem (Tamilnadu)","Warangal (Telangana)"]," Sriharikotta (Andhra Pradesh)"),
    new Question("The 'Black flag' signifies?",["revolution/danger","peace","protest","truce"],"protest"),
    new Question("Philology is the?",["study of bones","study of muscles","study of architecture","science of languages"],"science of languages"),
    ];
    quiz = new Quiz(questions);
    populate();
})
}

if(sports){
  sports.addEventListener('click',function(){
    questions = [
      new Question("Who was the longest reinging WWE World Heavyweight Champion?", ["Devansh","Roman Reings","John Cena","Undertaker"], "John Cena"),
      new Question("The modern Olympic Games were started in the year?", ["1830","1669","1896","2003"], "1896"),
      new Question("Euro Cup is related to which of the following sports?", ["Football","Bdminton","Javelin Throw","Squash"], "Football"),
      new Question("Who is the captain of England cricket team who won ICC cricket World Cup 2019?", ["Eoin Morgan","Ben Stokes","David Warner","Virat Kohli"], "Eoin Morgan"),
      new Question("What is the national sport of the United States of America (USA)?", ["Football","Baseball","Basketball","Squash"], "Baseball"),
      new Question("After how many Year’s FIFA World Cup is held?", ["3","6","4","Every Year"], "4"),
      new Question("Which team won the first Indian Premier League (IPL) held in 2008?", ["Sunrisers Hyderabad","Rajasthan Royals","Mumbai Indians","Chennai Super Kings"], "Rajasthan Royals"),
      new Question("Who won the first ICC World Cup?", ["India","Zimbabwe","West Indies","England"], "West Indies"),
      new Question("Who won the Gold Medal in Javelin Throw in Tokyo Olymics 2020?", ["Devansh Mishra","Neeraj Chopra","Kedar Jadhav","Ravindra Jadeja"], "Neeraj Chopra"),
      new Question("Who among the following is the first batsman to hit six sixes in an over?", ["Ravi Shashtri","Garfield Sobers","Yuvraj Singh","Don Bradman"], "Garfield Sobers"),
    ];
    quiz = new Quiz(questions);
    populate();
  })
}


if(history){
  history.addEventListener('click',function(){
    questions = [
      new Question("Who among the following is the author of 'Indica' ?", ["Ashoka","Chankya","Megasthenes","Seleucus"], "Megasthenes"),
      new Question("Who built a temple of Augustus at Muzris?", ["Romans","Cholas","Pandyas","Cheras"], "Romans"),
      new Question("Who said that Tibet is the original home of Aryans?",["Swami Dayanand Saraswati","Bal Gangadhar Tilak","Max Muller","A.C. Das"],"Swami Dayanand Saraswati"),
      new Question("Varanasi was the capital of which of the following mahajanapada?",["Mallas","Vajji","Kosala"," Kashi"],"Kashi"),
      new Question("Who was the father of Bindusara?",["Chandragupta Maurya","Samudragupta","Ashoka"," Bhadrabahu"],"Chandragupta Maurya"),
      new Question("What does the use of 'Elephant' as a motif in the Ashokan pillar symbolizes?",["Departure of Siddhartha","Purity and Fecundity","Pride and Courage","Buddha\’s conception"],"Buddha\’s conception"),
      new Question("Which marriage of Vedic Period is known as love marriage?",["Brahma Vivah","Arsha Vivah","Daiva Vivah","Gandharva Vivah"],"Gandharva Vivah"),
      new Question("The theory of economic drain of India during British imperialism was propounded by?",["Jawaharlal Nehru","Dadabhai Naoroji","R.C. Dutt","M.K. Gandhi"],"Dadabhai Naoroji"),
      new Question("Todar Mal was associated with?",["music","literature","finance","law"],"finance"),
      new Question("Vikramaditya, a king of Ujjain, started the Vikrama samvat in 58 BC in commemoration of his victory over?",["Indo-Greeks","Sakas","Parthinas","Kushanas"],"Sakas"),
        ];
    quiz = new Quiz(questions);
    populate();
  })
}

if(music){
  music.addEventListener('click',function(){
    questions = [
      new Question("How many members are there in Korean boy band - BTS?", ["9","7","6","5"], "7"),
      new Question("In which year did the Spice Girls release Wannabe?", ["2007","2000","1996","1999"], "1996"),
      new Question("Which singer 'can't stop staring at those ocean eyes'?", ["Billie Eilish","Ed Sheeran","Justin Bieber","Drake"], "Billie Elish"),
      new Question("Will.i.am is best known for being part of which hip hop group?", ["Black Eyed Peas","K","Blacks","We R Jacksons"], "Black Eyed Peas"),
      new Question("Who had a No.1 hit with “Ice Ice Baby”?", ["Vanilla","Nile","That","Icy"], "Vanilla"),
      new Question("Björn Again is a tribute band for which world-famous pop group?", ["My Girl","Honest","Rihhana","Abba"], "Abbaa"),
      new Question("Which American hip hop duo had a 1986 hit with 'Push It'?", ["Thyrodium","Diamond","Salt-N-Pepa","Degeration X"], "Salt-N-Pepa"),
      new Question("Name the band that Phil Collins is a part of.", ["Degeneration X","SHEILD","Genesis","99"], "Genesis"),
      new Question("Who is the best-selling female artist of all time?", ["Oceania","Neha Kakkar","Dina","Madonna"], "Madonna"),
      new Question("What is the best-selling single of all-time worldwide?", ["Devoo","OOOO","White Christmas","Pangea"], "White Christmas"),
];
    quiz = new Quiz(questions);
    populate();
  })
}

if(food){
  food.addEventListener('click',function(){
    questions = [
      new Question("Which candy bar is described as \"stuffed with peanuts\"?",["Reese's","Twix","Baby Ruth","Snickers"], "Snicker"),
      new Question("What is paneer?", ["A type of chutney","A type of cheese","A type of bread","A type of beer"],"A type of cheese"),
      new Question("What is the main ingredient in the drink lassi?",["Mango","Milk","Coconut","Yogurt"],"Yogurt"),
      new Question("The spice turmeric is used in Indian cuisine both for its flavour and color. What color does it give to a dish?",["Green"," Red","Yellow","Purple"],"Yellow"),
      new Question("Which variety of rice is often referred to as the 'Queen of Rice'?",["Jasmine","Basmati","Arborio","Sticky"],"Basmati"),
      new Question("Which of these has the highest percentage of water?",["Cucumber","Lettuce","Celery","Squash"],"Cucumber"),
      new Question("What fruit is also known as an 'alligator pear'?",["Kiwi fruit","Avocado","Osage orange","Salak"],"Avocado"),
      new Question(" What is the most popular vegetable in the United States?",["Artichoke","Zucchini","Broccoli","Brussels Sprouts"],"Brussels Sprouts"),
      new Question(" Which of these vegetables was the first to be grown in space?",["Radish","Potato","Peas","Swede"],"Radish"),
      new Question("  The biggest pumpkin ever recorded was grown in Germany in 2016. How much did it weigh?",["310 kg","642 kg","917 kg","1190 kg"],"1190kg"),
        ];
    quiz = new Quiz(questions);
    populate();
  })
}

if(science){
  science.addEventListener('click',function(){
    questions = [
      new Question("Which of the following is a non metal that remains liquid at room temperature?", ["Mercury","Bromine","Silver","Uranium"], "Bromine"),
      new Question("Chlorophyll is a naturally occurring chelate compound in which central metal is", ["Magnesium","Hydrogen","Carbon","Uranium"], "Magnesium"),
      new Question("Which of the following is used in pencils?", ["Graphite","Granite","Silver","Carbon"], "Graphite"),
      new Question("Which of the following metals forms an amalgam with other metals?", ["Helium","Mercury","Oxygen","Chlorine"], "Mercury"),
      new Question("What is the life span of WBC?", ["1-2 Days","2-15 Days","7-21 Days","3-9 Days"], "2-15 Days"),
      new Question("What is the life span of RBC?", ["13 Days","365 Days","120 Days","62 Days"], "120 Days"),
      new Question("There are _____ number of muscles in human.", ["639","788","143","545"], "639"),
      new Question(" _________________ is the longest cell", ["Speen","Skin","Nerve","None"], "Nerve"),
      new Question("The largest cell is ________________", ["Speen","The egg of an Ostrich","Kedar","Egg"], "The egg of an Ostrich"),
      new Question("What is the physical phase of life called? ", ["Nucleas","Chlloroplasm","Cytoplasm","Protoplasm"], "Protoplasm"),
      ];
    quiz = new Quiz(questions);
    populate();
  })
}


if(wordPlay){
  wordPlay.addEventListener('click',function(){
    questions = [
      new Question("Which of these words means \"tighten\"?",["consolidate","conduct","consign","constrict"], "constrict"),
      new Question("Which of these is a kind of police officer?", ["conductor","constable","con man","condiment"],"constable"),
      new Question("Which of these is helpful, as in criticism?",["destructive","constructive","restrictive","inductive"],"constructive"),
      new Question("Which of these means \"to look closely at\"?",["excoriate","examine","exhume","exterminate"],"examine"),
      new Question("Which of these means \"out of the ordinary\"?",["accepted","excepted","exemptive","exceptional"],"exceptional"),
      new Question("Which of these means \"limited\"or \"restricted\"?",["exclusive","exhaustive","excursive","exemptive"],"exclusive"),
      new Question("Which of these means \"send away\"?",["exile","exhume","exempt","exhaust"],"exile"),
      new Question("Which of these means \"strange\"?",["exhaustive","expressive","exotic","exhilarating"],"exotic"),
      new Question("Which of these might follow a jet aircraft?",["compact","concern","contract","contrail"],"contrail"),
      new Question("Which of these words means \"a formal inquiry\"?",["disquisition","disposition","distribution","delectation"],"disquisition"),
        ];

    quiz = new Quiz(questions);
    populate();
  })
}


if(computer){
  computer.addEventListener('click',function(){
    questions = [
      new Question("What do you call a computer on a network that requests files from another computer?", ["network","Client","Silver","Bluetooth"], "Client"),
      new Question("Which is not an Internet protocol?", ["MMWF","OTP","TTP","STP"], "STP"),
      new Question("www stands for:", ["World Wide Web","Granite","Silver","Carbon"], "World Wide Web"),
      new Question("Which of the following memories is an optical memory?", ["Floppy Disk","Bubble Memories","CD–ROM","Core Memories"], "CD–ROM"),
      new Question("Java was originally invented by", ["Sun","Oracle","Microsoft","Novell"], "Sun"),
      new Question("The unit of speed used for super computer is", ["KELOPS","3ELOPS","PELOPS","GELOPS"], "GELOPS"),
      new Question("AOL stands for:", ["America Oracle Linux","America On-line","America Only Line","545"], "America On-line"),
      new Question("Whose trademark is the operating system UNIX?", ["Motorola","Metrops","BELL Laboratories","AshtonTate"], "BELL Laboratories"),
      new Question("The first mechanical computer designed by Charles Babbage was called", ["Disk Engine","Analytical Engine","Unreal Engine","Unity"], "Analytical Engine"),
      new Question("Another name for a computer chip is: ", ["Microprocessor","Execute","Select","Micro chip"], "Micro chip"),
];
    quiz = new Quiz(questions);
    populate();
  })
}



if(potLuck){
  potLuck.addEventListener('click',function(){
    questions = [
    new Question("Early in the century who wrote the novel The Lost World?",["Thomas Mann","Arthur Conan Doyle","Willia Cather","Joseph Conrad"],"Arthur Conan Doyle"),
    new Question("Which 1994 hit came from the movie With Honors?",[" I'll Remember","Forest Gump","The Shawshank Redemption","Pulp Fiction"]," I'll Remember"),
    new Question("Which state was Tracy Chapman born in?",["Austin","Denver","Ohio","Phoenix"],"Ohio"),
    new Question("Which language does the word ombudsman derive from?",["Portuguese","Turkish","Italian","Swedish"],"Swedish"),
    new Question("Nat King Cole was a native of which US state?",["Alabama","Texas","Florida","Montana"],"Alabama"),
    new Question("Who won the Oscar for best producer for Reds?",["Kathryn Bigelow","Warren Beatty","James Cameron","Peter Jackson"],"Warren Beatty"),
    new Question("Who won the Best Director Oscar for the English Patient?",["Frank Lloyd","Lewis Milestone","Anthony Minghella","Norman Taurog"],"Anthony Minghella"),
    new Question("What are the international registration letters of a vehicle from Switzerland?",["IS","LT","UZ","CH"],"CH"),
    new Question("What does A stand for in GATT?",["Agreement","Abashed","abasement","abaciscus"],"Agreement"),
    new Question("What was Wilhelm Rontgen's most important discovery?",["Zinc-Carbon Battery","X-rays","CT","MRI"],"X-rays"),
  
    ];
    quiz = new Quiz(questions);
    populate();
  })
}


const info_box = document.querySelector(".info_box");
const exit_btn = info_box.querySelector(".buttons .quit");
const continue_btn = info_box.querySelector(".buttons .restart");

if(info_box){}
if(continue_btn){
continue_btn.onclick = ()=>{
  info_box.classList.remove("activeInfo");
  time = setInterval(myTimer, 1000);
  }
}
if(exit_btn){
  exit_btn.onclick = ()=>{
  info_box.classList.remove("activeInfo"); //hide info box
  window.location.href = 'QuizPage.html'
  }
}