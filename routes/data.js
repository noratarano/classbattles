// Data ///////////////////////////////////////////////////////////////////////

this.Users = [
    { user: {
        username: 'Nora',
        email: 'ntarano@stanford.edu',
        about: 'EE Masters student at Stanford University.',
		online: true,
        classes: [
            { 'class': {
                name: 'CS 147',
                classname: 'CS 147',
                tags: [
		            {tag: 'js', 			points: 10},
	                {tag: 'html', 			points: 3},
	                {tag: 'css', 			points: 2},
					{tag: 'git', 			points: 5},
					{tag: 'needfinding', 	points: 5},
					{tag: 'prototyping', 	points: 10},
                ],
                history: [
                    { question: 'What does CSS stand for?', correct: true },
                    { question: 'What does HTML stand for?', correct: false }
                ],
				currentChallenge: null
            }},
            { 'class': {
                name: 'CS 106',
                classname: 'CS 106',
                tags: [
	                {tag: 'js', points: 10},
	                {tag: 'html', points: 6},
	                {tag: 'css', points: 8},
	                {tag: 'servers', points: 7}
                ],
                history: [
                    { question: 'What does CSS stand for?', correct: true },
                    { question: 'What does HTML stand for?', correct: false }
                ],
				currentChallenge: null
            }}
        ]
    }},
    { user: {
        username: 'Diana',
        email: 'bdiana@stanford.edu',
        about: 'Awesome possum. Loves walks on the beach and being awesome, in general.',
		online: false,
        classes: [
	        { 'class': {
	            name: 'CS 147',
	            classname: 'CS 147',
	            tags: [
	                {tag: 'js', 			points: 10},
	                {tag: 'html', 			points: 6},
	                {tag: 'css', 			points: 8},
					{tag: 'git', 			points: 11},
					{tag: 'needfinding', 	points: 9},
					{tag: 'prototyping', 	points: 10},
	            ],
                history: [
                    { question: 'What does CSS stand for?', correct: true },
                    { question: 'What does HTML stand for?', correct: false }
                ],
				currentChallenge: null
	        }}
        ]
    }},
    { user: {
        username: 'Ish',
        email: 'menjivar@stanford.edu',
        about: 'CS Junior at Stanford University.',
		online: true,
        classes: [
            { 'class': {
                name: 'CS 147',
                classname: 'CS 147',
                tags: [
	                {tag: 'js', 			points: 10},
	                {tag: 'html', 			points: 6},
	                {tag: 'css', 			points: 8},
					{tag: 'git', 			points: 11},
					{tag: 'needfinding', 	points: 9},
					{tag: 'prototyping', 	points: 10},
                ],
                history: [
                    { question: 'What does CSS stand for?', correct: true },
                    { question: 'What does HTML stand for?', correct: false }
                ],
				currentChallenge: null
            }}
        ]
    }}
];

this.Classes = [
    { 'class': {
        name: 'CS 147',
        description: 'Introduction to Human Computer Interaction',
        tags: [
			{tag: 'js'},
			{tag: 'html'},
			{tag: 'css'},
			{tag: 'git'},
			{tag: 'needfinding'},
			{tag: 'prototyping'}
		],
        questions: [{
            id: '1',
            question: 'You are a researcher interested in finding out what times of the day people are the sleepiest. Which technique would allow you to collect the most data with the greatest accuracy?',
            answer: 'Experience Sampling / Pager Study',
            options: [
				'Experience Sampling / Pager Study',
				'Participant Observation',
				'Survey',
				'Interview',],
            tags: [{tag: 'needfinding', points: 10}]
        },{
            id: '2',
            question: 'What is the single biggest problem with asking the previous question (“Which quarter would you prefer CS 147 to be offered?”) to students in this year’s class?',
            answer: 'We are asking a biased sample of target users.',
            options: [
				'We are asking a biased sample of target users.',
				'Current students do not generalize to future students.',
				'Question is too hypothetical.',
				'Insufficient usage of #octothorpe.'
			],
            tags: [{tag: 'needfinding', points: 10}]
        },{
            id: '3',
            question: 'Which technique is most appropriate for testing multiple interfaces to identify sources of confusion or inefficiency?',
            answer: 'Paper Prototype',
            options: [
				'Paper Prototype',
				'Storyboard',
				'Wizard of Oz Prototype',
				'Real Product'
			],
            tags: [{tag: 'prototyping', points: 10}]
        },{
            id: '4',
            question: 'Which technique is most appropriate for Capturing the task context and physical setting where your product will be used?',
            answer: 'Storyboard',
            options: [
				'Paper Prototype',
				'Storyboard',
				'Wizard of Oz Prototype',
				'Real Product'
			],
            tags: [{tag: 'prototyping', points: 10}]
        },{
            id: '5',
            question: 'Adding class=”quiz” to an HTML element...',
            answer: 'Applies any styling with the selector “.quiz” in your linked CSS files.',
            options: [
				'Applies any styling with the selector “.quiz” in your linked CSS files.',
				'Removes all non-quiz styling the element may have.',
				'Only works on <div>, <a>, and header elements.',
				'All of the above'
			],
            tags: [{tag: 'html', points: 5}, {tag:'css', points: 5}]
        },{
            id: '6',
            question: 'Which Javascript code does the following? Find the element with ID "submitBtn" and listen for clicks on the button. When a user clicks on the button, it should call the function called "updateAccounts".',
            answer: '$("#submitBtn).click(updateAccounts)',
            options: [
				'$.click("#submitBtn", updateAccounts)',
				'$("#submitBtn", updateAccounts).click()',
				'$("#submitBtn).click(updateAccounts)',
				'$(“#submitBtn.click).updateAccounts()'
			],
            tags: [{tag: 'js', points: 5}]
        },{
            id: '7',
            question: 'Forking a Github repository...',
            answer: 'Clones it into your online account',
            options: [
				'Clones it into your online account',
				'Copies it onto your computer',
				'Prevents you from making your own changes without affecting the master',
				'Automatically updates the master with your changes'
			],
            tags: [{tag: 'git', points: 5}]
        }]
    }},
	{ 'class': {
        name: 'CS 106',
        description: 'Programming',
        tags: [{tag: 'js'}, {tag: 'html'}, {tag: 'css'}, {tag: 'servers'}],
        questions: [{
            id: '#0',
            question: 'What does CSS stand for?',
            correctAnswer: 'Cascading Style Sheets',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'css', points: 5}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        }]
    }},
	{ 'class': {
        name: 'Triv 101',
        description: 'Trivia',
        tags: [{tag: 'history'}],
        questions: [{
            id: '1',
            question: 'What famous document begins: "When in the course of human events..."?',
            answer: 'The Declaration of Independence',
            options: [
				'The Declaration of Independence',
				'The Constitution',
				'The Bill of Rights',
				'The Emancipation Proclamation',
			],
            tags: [{tag: 'history', points: 5}]
        },{
            id: '2',
            question: 'What so-called "war" spawned the dueling slogans "Better Dead Than RED" and "Better Red Than Dead" in the 1950s?',
            answer: 'The Cold War',
            options: [
				'The Cold War',
				'The Vietnam War',
				'World War I',
				'The Soccer War'
			],
            tags: [{tag: 'history', points: 5}]
        },{
            id: '3',
            question: 'What future Soviet dictator was training to be a priest when he got turned on to Marxism?',
            answer: 'Joseph Stalin',
            options: [
				'Joseph Stalin',
				'Georgy Malenkov',
				'Nikita Khrushchev',
				'Vladimir Lenin'
			],
            tags: [{tag: 'history', points: 5}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'html', points: 7}]
        }]
    }},
];

this.Colors = [
	{ name: 'turquoise'		, rgb: [26, 188, 156] },
	{ name: 'emerald'		, rgb: [46, 204, 113] },
	{ name: 'peter-river'	, rgb: [52, 152, 219] },
	{ name: 'amethyst'		, rgb: [155, 89, 182] },
	{ name: 'sun-flower'	, rgb: [241, 196, 15] },
	{ name: 'carrot'		, rgb: [230, 126, 34] },
	{ name: 'alizarin'   	, rgb: [231, 76, 60] },
	{ name: 'green-sea'   	, rgb: [22, 160, 133] },
	{ name: 'nephritis'   	, rgb: [39, 174, 96] },
	{ name: 'belize-hole'	, rgb: [41, 128, 185] },
	{ name: 'wisteria'   	, rgb: [142, 68, 173] },
	{ name: 'orange'		, rgb: [243, 156, 18] },
	{ name: 'pumpkin'		, rgb: [211, 84, 0] },
	{ name: 'pomegranate'	, rgb: [192, 57, 43] }
];

function getColors(n) {
	return this.Color.slice(0, n <= this.all.length ? n : this.all.length);
}

function rgbaColor(i, a) {
	var rgba = this.all[i % all.length].rgb;
	rgba.push(a);
	return 'rgba(' + rgba.join(',') + ')';
}