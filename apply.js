document.addEventListener('DOMContentLoaded', function () {
    const jobList = document.querySelector('.job-list');
    const jobCards = jobList.children.length;

    if (jobCards > 3) {
        document.querySelector('.job-list-wrapper').classList.add('scrollable');
    } else {
        document.querySelector('.job-list-wrapper').classList.remove('scrollable'); // Remove the scrollable class if 3 or less cards
    }
});
