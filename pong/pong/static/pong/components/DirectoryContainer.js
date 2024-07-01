import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);

        document.addEventListener('DOMContentLoaded', () => {
            const items = document.querySelectorAll('.item');
            const modal = document.getElementById('profile-modal');
            const span = document.getElementsByClassName('close-button')[0];
            const profileName = document.getElementById('profile-name');
            const profileRole = document.getElementById('profile-role');
            const profileImg = document.getElementById('profile-img'); 

            items.forEach(item => {
                item.addEventListener('click', function() {
                    const name = this.querySelector('.info h4').innerText;
                    const role = this.querySelector('.info p').innerText;
                    const imgSrc = this.querySelector('img').src; 
                    profileName.innerText = name;
                    profileRole.innerText = role;
                    profileImg.src = imgSrc;
                    modal.style.display = 'block';
                });
            });

            span.onclick = function() {
                modal.style.display = 'none';
            };

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        });
    }

    get html() {
        const teamMembers = [
            { name: 'Florencio Dorrance', role: 'Market Development Manager' },
            { name: 'Benny Spanbauer', role: 'Area Sales Manager' },
            { name: 'Jamel Eusebio', role: 'Administrator' },
            { name: 'Lavern Laboy', role: 'Account Executive' },
            { name: 'Alfonzo Schuessler', role: 'Proposal Writer' },
            { name: 'Daryl Nehls', role: 'Nursing Assistant' }
        ];

        const files = [
            { name: 'i9.pdf', type: 'PDF', size: '9mb' },
            { name: 'Screenshot-3817.png', type: 'PNG', size: '4mb' },
            { name: 'sharefile.docx', type: 'DOC', size: '555kb' },
            { name: 'Jerry-2020_I-9_Form.xxl', type: 'XXL', size: '24mb' }
        ];

        const teamMembersHtml = teamMembers.map(member => `
            <div class="item">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="info">
                    <h4>${member.name}</h4>
                    <p>${member.role}</p>
                </div>
            </div>
        `).join('');

        const filesHtml = files.map(file => `
            <div class="item">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="info">
                    <h4>${file.name}</h4>
                    <p>${file.type} • ${file.size}</p>
                </div>
                <div class="download">⬇</div>
            </div>
        `).join('');

        return (`
            <div class="dir-container">
                <div class="header">
                    <h2>Directory</h2>
                    <div class="options">•••</div>
                </div>
                <div class="section">
                    <h3>Team Members <span>(${teamMembers.length})</span></h3>
                    <div class="items">
                        ${teamMembersHtml}
                    </div>
                </div>
                <div class="section">
                    <h3>Files <span>(${files.length})</span></h3>
                    <div class="items">
                        ${filesHtml}
                    </div>
                </div>
                <div id="profile-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-button">&times;</span>
                        <img id="profile-img" class="profile-img"></h2>
                        <h2 id="profile-name"></h2>
                        <p id="profile-role"></p>
                    </div>
                </div>
            </div>
        `);
    }
}
