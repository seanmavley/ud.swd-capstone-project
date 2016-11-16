$(document).ready(function() {
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  Offline.options = {
    checkOnLoad: true,
    reconnect: {
      // Try to reconnect every 30 seconds
      initialDelay: 30
    }
  };

  Offline.on('down', function() {
    // clear any toastr notification on screen
    // already
    toastr.clear();
    toastr.warning('You are not connected to the internet', 'Offline mode', {
      timeOut: 10000
    });
  });

  Offline.on('up', function() {
    toastr.clear()
    toastr.success('Network is back', 'Now online', {
      timeOut: 8000
    });
  });
});