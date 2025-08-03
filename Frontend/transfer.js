 /* =================================================================
   Helper Functions
================================================================= */

function template_selector() {
    if ($('#template_1').prop('checked')) {
        generateCV('Template_1');
    } else if ($('#template_2').prop('checked')) {
        generateCV('Template_2');
    } else if ($('#template_3').prop('checked')) {
        generateCV('Template_3');
    } else {
        alert("Please select a template.");
    }
}

function visibler() {
    $(`.dwnldimage`).css('display', 'inline-block');
    $(`.printCv`).css('display', 'inline-block');
    $(`.back-to-form`).css('display', 'flex');
    $(`.palette`).css('display', 'block');
}

function printer() {
    $(`.dwnldimage`).css('display', 'none');
    $(`.printCv`).css('display', 'none');
    $(`.back-to-form`).css('display', 'none');
    $(`.palette`).css('display', 'none');
    window.print();
    setTimeout(visibler, 500);
}

for (let i = 0; i < 3; i++) {
    document.querySelectorAll(`.printCv`)[i].addEventListener('click', printer);
}


/* =================================================================
   AI Profile Generation Function (Defined Separately)
================================================================= */

async function generateAIProfile(template) {
    try {
        console.log("🚀 Starting AI profile generation...");

        // 1. Gather data for the AI prompt
        const workExperienceForAI = [];
        $('#accordionWork .accordion-item').each(function() {
            workExperienceForAI.push({
                job_title: $(this).find('.job_title').val(),
                company_name: $(this).find('.company_name').val(),
                description: $(this).find('.work_desc').val()
            });
        });

        const skillsForAI = [];
        $('#accordionSkill .accordion-item .skill').each(function() {
            if ($(this).val().trim() !== "") {
                skillsForAI.push($(this).val().trim());
            }
        });

        const promptData = {
            jobTitle: $('#jobTitle').val(),
            fullName: $('#fname').val() + " " + $('#lname').val(),
            experience: workExperienceForAI,
            skills: skillsForAI
        };

        // 2. Call your backend API
        const response = await fetch('http://localhost:5001/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptData: promptData }),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        const aiProfile = data.generatedText;

        // 3. Populate the profile section with the AI response
        if (aiProfile && aiProfile.trim() !== "") {
            console.log("✅ AI Profile generated successfully.");
            const formattedProfile = aiProfile.replaceAll("\n", "<br />");
            if (template == "Template_1") {
                $('.t1 .right_side .prof').html(`<p>${formattedProfile}</p>`);
            } else if (template == 'Template_2') {
                $('.t2 .lower_right .profile').html(`<div class="content">${formattedProfile}</div>`);
            } else if (template == 'Template_3') {
                $('.t3 .objective').html(`${formattedProfile}`);
            }
        } else {
            throw new Error("AI returned an empty profile.");
        }

    } catch (error) {
        console.error("Could not generate AI profile, using manual input as a fallback.", error);
        // Fallback to manual profile
        const profile = $(`#profile`).val().replaceAll("\n", "<br />\r\n");
        if (profile !== "") {
            if (template == "Template_1") {
                $('.t1 .right_side .prof').html(`<p>${profile}</p>`);
            } else if (template == 'Template_2') {
                $('.t2 .lower_right .profile').html(`<div class="content">${profile}</div>`);
            } else if (template == 'Template_3') {
                $('.t3 .objective').html(`${profile}`);
            }
        }
    }
}


/* =================================================================
   Main CV Generation Function
================================================================= */

async function generateCV(template) {

    // --- Initial Setup ---
    document.getElementById('form3').classList.remove('active');
    if (template == 'Template_3') { document.getElementById(template).style.display = 'block'; }
    else { document.getElementById(template).style.display = 'flex'; }
    document.getElementById('nav').style.display = 'none';

    // --- Image Download Logic ---
    document.querySelector('#dwnldimage').addEventListener('click', function () {
        let template2Image = $(`#${template}`).find('#target')[0];
        html2canvas(template2Image).then(function (canvas) {
            return Canvas2Image.saveAsPNG(canvas);
        });
    });

    // --- Call the AI Profile Function FIRST ---
    await generateAIProfile(template);

    // --- Profile Image ---
    let file = document.getElementById('inpImg').files[0];
    if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            document.getElementById(`${template}`).getElementsByClassName('profilepic')[0].src = reader.result;
        };
    }
    
    // --- Personal Details ---
    let dob = new Date($('#dob').val());
    $(`#${template} #t_name`).html($('#fname').val() + " " + $('#lname').val());
    $(`#${template} #t_gender`).html($('#gender').val());
    $(`#${template} #t_dob`).html(String(dob.getDate()).padStart(2, '0') + "/" + String(dob.getMonth() + 1).padStart(2, '0') + "/" + dob.getFullYear());
    $(`#${template} #t_email`).html($('#email').val());
    $(`#${template} #t_number`).html($('#number').val());
    $(`#${template} #t_address`).html($('#address').val() + "<br>" + $('#zip').val() + "<br>" + ($('#city-input').val() == null ? "" : $('#city-input').val() + ", ") + $('#state-input').val() + ", " + $('#country-input').val());

    if ($('#website').val().trim() == "") { $(`#${template} #t_website`).parent().css('display', 'none'); }
    else { $(`#${template} #t_website`).html($('#website').val()); }

    if ($('#linkedIn').val().trim() == "") { $(`#${template} #t_linkedIn`).parent().css('display', 'none'); }
    else { $(`#${template} #t_linkedIn`).html($('#linkedIn').val()); }
    
    // --- Education Section ---
    $('#accordionEdu .accordion-item').each(function() {
        let degree = $(this).find('.degree').val().trim();
        let school = $(this).find('.school').val().trim();
        let srt_date = new Date($(this).find('.edu_start').val()).getFullYear();
        let end_date = $(this).find('.end_date_toggle').prop('checked') ? 'Present' : new Date($(this).find('.end_date').val()).getFullYear();
        if (degree == "" || school == "" || isNaN(srt_date)) return;

        if (template == "Template_1") { $('.t1 .left_side .education ul').append(`<li><h5>${srt_date} - ${end_date}</h5><h4>${degree}</h4><h4>${school}</h4></li>`); }
        else if (template == 'Template_2') { $('.t2 .lower_right .education .content').append(`<div class="con"><h4 class="time">${srt_date} - ${end_date}</h4><h4 class="degree">${degree}</h4><h4 class="uni">${school}</h4></div>`); }
        else if (template == 'Template_3') { $('.t3 .education').append(`<p class="degree">${degree}&nbsp; (${srt_date}-${end_date})</p><p class="par-4">${school}</p>`); }
    });
    
    // --- Work Experience Section ---
    $('#accordionWork .accordion-item').each(function() {
        let job_title = $(this).find('.job_title').val().trim();
        let company_name = $(this).find('.company_name').val().trim();
        let work_desc = $(this).find('.work_desc').val().trim();
        let srt_date = new Date($(this).find('.work_start').val()).getFullYear();
        let end_date = $(this).find('.end_date_toggle').prop('checked') ? 'Present' : new Date($(this).find('.end_date').val()).getFullYear();
        if (job_title == "" || company_name == "" || isNaN(srt_date)) return;
        
        if (template == "Template_1") { $('.t1 .right_side .experience').append(`<div class="box"><div class="year_company"><h5>${srt_date} - ${end_date}</h5><h5>${company_name}</h5></div><div class="text"><h4>${job_title}</h4><p>${work_desc}</p></div></div>`); }
        else if (template == 'Template_2') { $('.t2 .lower_right .experience .content').append(`<div class="con"><div class="time"><h4>${srt_date}-${end_date}</h4><h4>${company_name}</h4></div><div class="box"><div class="text">${job_title}</div><div class="exp">${work_desc}</div></div></div>`); }
        else if (template == 'Template_3') { $('.t3 .content-box .experience').append(`<p class="job-title">${job_title}&nbsp;at&nbsp;${company_name}&nbsp;(${srt_date}-${end_date})</p><p class="par-4">${work_desc}</p>`); }
    });

    // --- Skills Section ---
    $('#accordionSkill .accordion-item').each(function() {
        let skill = $(this).find('.skill').val().trim();
        if (skill == "") return;
        if (template == "Template_1") { $('.t1 .right_side .skills .box').append(`<h4>${skill}</h4>`); }
        else if (template == 'Template_2') { $('.t2 .lower .lower_left .skills .content').append(`<div class="skill">${skill}</div>`); }
        else if (template == 'Template_3') { $('.t3 .skills').append(`<li><span>${skill}</span></li>`); }
    });

    // --- Interest Section ---
    $('#accordionInt .accordion-item').each(function() {
        let interest = $(this).find('.hobby').val().trim();
        if (interest == "") return;
        if (template == "Template_1") { $('.t1 .right_side .interest ul').append(`<li>${interest}</li>`); }
        else if (template == 'Template_2') { $('.t2 .lower .lower_left .interests .content').append(`<div class="con">${interest}</div>`); }
        else if (template == 'Template_3') { $('.t3 .interest').append(`<li><span>${interest}</span></li>`); }
    });

    // --- Languages Section ---
    $('#accordionLang .accordion-item').each(function() {
        let lang = $(this).find('.lang').val().trim();
        if (lang == "") return;
        if (template == "Template_1") { $('.t1 .left_side .language ul').append(`<li><span class="text">${lang}</span></li>`); }
        else if (template == 'Template_2') { $('.t2 .lower .lower_left .languages .content .con').append(`<div class="lang">${lang}</div>`); }
        else if (template == 'Template_3') { $('.t3 .content-box .languages').append(`<p class="p3">${lang}</p>`); }
    });

    // --- Achievements Section ---
    let achv = $(`#achv_description`).val().replaceAll("\n", "<br />\r\n");
    if (achv !== "") {
        if (template == "Template_1") { $('.t1 .right_side .achievements').append(`<p>${achv}</p>`); }
        else if (template == 'Template_2') { $('.t2 .lower_right .achievements .content .con').append(`<div class="val">${achv}</div>`); }
    }
}