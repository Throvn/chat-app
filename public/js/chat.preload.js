if(!location.search || location.search.split('=').length < 3 || !location.search.includes('name') || !location.search.includes('room')) {
    location.replace('./')
}
function toggleThemes() {
    const style = document.getElementById('bootstrap-style');
    if(style.getAttribute('href').includes('dark')) {
        style.setAttribute('href', './css/bootstrap.min.css')
    } else style.setAttribute('href', './css/bootstrap.dark.min.css');
}