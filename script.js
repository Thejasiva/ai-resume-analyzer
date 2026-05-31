// ======================
// Elements
// ======================

const browseBtn = document.getElementById("browseBtn");
const resumeFile = document.getElementById("resumeFile");
const analyzeBtn = document.querySelector(".analyze-btn");
const themeBtn = document.getElementById("themeBtn");

const loader = document.getElementById("loader");
const resumeTextArea = document.getElementById("resumeText");
const atsScore = document.getElementById("atsScore");
const analysisList = document.getElementById("analysisList");
const missingKeywords = document.getElementById("missingKeywords");
const suggestionsList = document.getElementById("suggestionsList");

const progressCircle =
document.querySelector(".progress");



const jobDescription =
document.getElementById(
    "jobDescription"
);

const jobMatchScore =
document.getElementById(
    "jobMatchScore"
);

const matchingKeywords =
document.getElementById(
    "matchingKeywords"
);

const strengthsList =
document.getElementById(
    "strengthsList"
);

const weaknessesList =
document.getElementById(
    "weaknessesList"
);


// ======================
// Theme Toggle
// ======================

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        localStorage.setItem("theme","dark");
        themeBtn.textContent = "☀️";
    }else{
        localStorage.setItem("theme","light");
        themeBtn.textContent = "🌙";
    }

});


// ======================
// File Upload
// ======================

browseBtn.addEventListener("click", () => {
    resumeFile.click();
});

resumeFile.addEventListener("change", () => {

    const file = resumeFile.files[0];

    if(file){
        browseBtn.textContent = file.name;
    }

});


// ======================
// Analyze Button
// ======================

analyzeBtn.addEventListener("click", async () => {

    const file = resumeFile.files[0];

    if(!file){
        alert("Please upload a PDF resume.");
        return;
    }

    try{

        loader.classList.remove("hidden");
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";

        const text = await extractPDFText(file);

        resumeTextArea.value = text;

        analyzeResume(
            text,
            jobDescription.value
        );

    }
    catch(error){

        console.error(error);

        alert(
            "Failed to read PDF. Please upload a valid PDF resume."
        );

    }
    finally{

        loader.classList.add("hidden");
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Resume";

    }

});


// ======================
// PDF Extraction
// ======================

async function extractPDFText(file){

    const arrayBuffer =
        await file.arrayBuffer();

    const pdf =
        await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

    let text = "";

    for(let pageNum = 1;
        pageNum <= pdf.numPages;
        pageNum++){

        const page =
            await pdf.getPage(pageNum);

        const content =
            await page.getTextContent();

        const pageText =
            content.items
                .map(item => item.str)
                .join(" ");

        text += pageText + "\n";

    }

    return text;
}


// ======================
// Resume Analysis
// ======================

function analyzeResume(
    text,
    jobText
){

    const lowerText =
        text.toLowerCase();

    const keywords = [
        "html",
        "css",
        "javascript",
        "react",
        "node",
        "sql",
        "git",
        "docker"
    ];

    let found = 0;

    let missing = [];

    keywords.forEach(keyword => {

        if(lowerText.includes(keyword)){
            found++;
        }else{
            missing.push(keyword);
        }

    });

    const score =
        Math.round(
            (found / keywords.length) * 100
        );

    updateScore(score);

    generateAnalysis(score);

    calculateJobMatch(
        text,
        jobText
    );

    //generateMissingKeywords(missing);

    generateSuggestions(score);

}


function calculateJobMatch(
    resumeText,
    jobText
){

    if(!jobText.trim()){

        jobMatchScore.textContent = "--";
        return;
    }

    const resume =
        resumeText.toLowerCase();

    const job =
        jobText.toLowerCase();

    const requiredSkills =
        SKILLS.filter(skill =>
            job.includes(skill)
        );

    if(requiredSkills.length === 0){

        jobMatchScore.textContent = "0%";
        return;
    }

    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(skill => {

        if(resume.includes(skill)){
            matchedSkills.push(skill);
        }
        else{
            missingSkills.push(skill);
        }

    });

    const percentage =
        Math.round(
            (matchedSkills.length /
            requiredSkills.length) * 100
        );

    jobMatchScore.textContent =
        percentage + "%";

    updateMatchingSkills(
        matchedSkills
    );

    generateMissingKeywords(
        missingSkills
    );

    analyzeResumeSections(
    resumeText,
    matchedSkills,
    missingSkills
);

}


function analyzeResumeSections(
    resumeText,
    matchedSkills,
    missingSkills
){

    strengthsList.innerHTML = "";
    weaknessesList.innerHTML = "";

    const strengths = [];
    const weaknesses = [];

    const text =
        resumeText.toLowerCase();

    if(text.includes("education")){
        strengths.push(
            "Education section found"
        );
    }

    if(text.includes("project")){
        strengths.push(
            "Projects section found"
        );
    }

    if(text.includes("experience")){
        strengths.push(
            "Experience section found"
        );
    }

    if(matchedSkills.length >= 3){
        strengths.push(
            "Good skill alignment with job description"
        );
    }

    if(missingSkills.length > 0){
        weaknesses.push(
            `${missingSkills.length} required skills missing`
        );
    }

    if(!text.includes("certification")){
        weaknesses.push(
            "No certifications detected"
        );
    }

    if(!/\d+%|\d+\+|\$\d+/.test(text)){
        weaknesses.push(
            "No measurable achievements detected"
        );
    }

    strengths.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent =
            "✓ " + item;

        strengthsList.appendChild(li);

    });

    weaknesses.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent =
            "⚠ " + item;

        weaknessesList.appendChild(li);

    });

}



function updateMatchingSkills(
    matchedSkills
){

    matchingKeywords.innerHTML = "";

    if(matchedSkills.length === 0){

        matchingKeywords.innerHTML =
            "<span>None Found</span>";

        return;
    }

    matchedSkills.forEach(skill => {

        const tag =
            document.createElement("span");

        tag.textContent = skill;

        matchingKeywords.appendChild(tag);

    });

}


// ======================
// ATS Score
// ======================

function updateScore(score){

    atsScore.textContent =
        score + "%";

    const circumference = 440;

    const offset =
        circumference -
        (score / 100) * circumference;

    progressCircle.style.strokeDashoffset =
        offset;

}


const SKILLS = [

    // Frontend
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",

    // Backend
    "node",
    "express",
    "java",
    "spring",
    "python",
    "django",

    // Database
    "sql",
    "mysql",
    "postgresql",
    "mongodb",

    // Cloud
    "aws",
    "azure",
    "gcp",

    // DevOps
    "docker",
    "kubernetes",
    "jenkins",
    "ci/cd",

    // Tools
    "git",
    "github",
    "rest api",
    "graphql"
];


// ======================
// Analysis
// ======================

function generateAnalysis(score){

    analysisList.innerHTML = "";

    const results = [];

    if(score >= 80){

        results.push(
            "Strong keyword coverage."
        );

        results.push(
            "Good ATS compatibility."
        );

    }
    else if(score >= 50){

        results.push(
            "Average keyword coverage."
        );

        results.push(
            "Resume can be improved."
        );

    }
    else{

        results.push(
            "Low ATS optimization."
        );

        results.push(
            "Missing several key skills."
        );

    }

    results.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        analysisList.appendChild(li);

    });

}


// ======================
// Missing Keywords
// ======================

function generateMissingKeywords(missing){

    missingKeywords.innerHTML = "";

    if(missing.length === 0){

        missingKeywords.innerHTML =
            "<span>None 🎉</span>";

        return;
    }

    missing.forEach(skill => {

        const tag =
            document.createElement("span");

        tag.textContent = skill;

        missingKeywords.appendChild(tag);

    });

}


// ======================
// Suggestions
// ======================

function generateSuggestions(score){

    suggestionsList.innerHTML = "";

    const suggestions = [];

    if(score < 100){

        suggestions.push(
            "Add more technical keywords relevant to your role."
        );
    }

    suggestions.push(
        "Use measurable achievements."
    );

    suggestions.push(
        "Include project outcomes and impact."
    );

    suggestions.push(
        "Optimize your professional summary."
    );

    suggestions.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        suggestionsList.appendChild(li);

    });

}