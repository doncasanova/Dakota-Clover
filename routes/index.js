const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { body, validationResult } = require('express-validator/check');
const router = express.Router();
const Upload = mongoose.model('Upload');
const EmailList = mongoose.model('EmailList');
const path = require('path');
const auth = require('http-auth');
const basic = auth.basic({
    file: path.join(__dirname, '../users.htpasswd')
});


router.get('/about', (req, res) => {
    res.render('about');

});

router.get('/gallery', (req, res) => {
    res.render('gallery');

});

router.get('/live-videos', (req, res) => {
    res.render('live-videos');

});


router.get('/download', (req, res) => {
    res.render('download');

});

router.get('/blog', (req, res) => {
    res.render('blog');

});

router.get('/contact', (req, res) => {
    res.render('contact');

});

router.get('/form', (req, res) => {
    res.render('form');

});
//email list
router.post('/email',
    
    [
        body('name')
            .isLength({ min: 1 })
            .withMessage('Please enter your name'),
        body('email')
        .isLength({ min: 1 })
        .withMessage('Please enter an email address')
    ],

        (req, res) => {
        let event = req.body;
        console.log(req.body);

            let emailList = new EmailList(req.body);

            emailList.save()
            .then(() => {
                res.render('about', { title: 'Login form', pageHeader: 'Login Page', thankYou: 'Thank you for your registration!' });

            })
            .catch(() => { res.send('Sorry! Something went wrong.'); });

    }

);
//-------------------------------------------------------------------------------------------
// get email list
router.get('/get-email', (req, res) => {

    EmailList.find()
        .then((emailList) => {
            //console.log(emailList);
            res.render('emailList', { title: 'Listing registrations', emailList });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });


});
//-------------------------------------------------------------------------

//event post route
router.post('/',
   
    [
        body('name')
            .isLength({ min: 1 })
            .withMessage('Please enter a name'),
        body('address')
            .isLength({ min: 1 })
            .withMessage('Please enter an email'),
        body('date')
            .isLength({ min: 1 })
            .withMessage('Please enter an date'),
        body('time')
            .isLength({ min: 1 })
            .withMessage('Please enter an time')
    ],

    (req, res) => {
        let event = req.body;
        console.log(event);

            let upLoad = new Upload(req.body);

            upLoad.save()
                .then(() => {
                    res.render('login', { title: 'Login form', pageHeader: 'Login Page', thankYou: 'Thank you for your registration!' });

                })
                .catch(() => { res.send('Sorry! Something went wrong.'); });
        
    }

);

router.get('/registrations', (req, res) => {
    Upload.find()
        .then((uploads) => {
            console.log(uploads);
            res.render('index', { title: 'Listing registrations', uploads });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});
//--------------------------------------------------------------------------------------

//sends events to frontend by sorting relative to current date.  
router.get('/', (req, res) => {
    //console.log("inside get events");
    var fullDate = new Date();
    var day = fullDate.getDate(); //day of the month
    var month = fullDate.getMonth() + 1; //month of year
    var year = fullDate.getUTCFullYear(); //year

    if (day < 10) {
        day = ("0" + day); 
    };

    if (month < 10) {
        month = ("0" + month);
    };

    //console.log("test full date " + fullDate);
    //console.log("test year " + year + "-" + month + "-" + day);

    var currentDate = (year + "-" + month + "-" + day);
    
    //console.log("upload events  " + currentDate);

    Upload.find({ date: { $gte: currentDate } }).sort({ date: 1 }).exec(function (err, uploadsResults) {
        console.log("inside sort");
        //loads a dummy object in the event there are no events
        if (uploadsResults.length <= 0) {
            uploadsResults = dummyObject;
        }
        //console.log(uploadsResults);
        if (err) {
            res.send(err);
        } else if (uploadsResults.length) {
            res.render('index', { 'events': uploadsResults });
           
        } else {
            res.send('no events found');
        }
    });
});

//-------------------------------------------------------------------------------

//sends past events to frontend by sorting relative to current date.  
router.get('/past-events', (req, res) => {
    console.log("inside past-events");
    var fullDate = new Date();
    var day = fullDate.getDate(); //day of the month
    var month = fullDate.getMonth() + 1; //month of year
    var year = fullDate.getUTCFullYear(); //year

    var currentDate = (year + "-" + month + "-" + day);

    console.log("upload events  " + currentDate);

    Upload.find({ date: { $lt: currentDate } }).sort({ date: 1 }).exec(function (err, uploadsResults) {
        console.log("inside sort past events");
        //loads a dummy object in the event there are no events
        if (uploadsResults.length <= 0) {
            uploadsResults = dummyObject;
        }
        //console.log(uploadsResults);
        if (err) {
            res.send(err);
        } else if (uploadsResults.length) {
            res.render('past-events', { 'events': uploadsResults });

        } else {
            res.send('no events found');
        }
    });
});

//-------------------------------------------------------------------------------------------

//test route for when working on rendering to front end.
router.get('/test', (req, res) => {
    console.log("This is the dummy " + dummyObject[0].date);
    var fullDate = new Date();

    var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);

    var currentDate = fullDate.getFullYear() + "-" + twoDigitMonth + "-" + fullDate.getDate();
    var test = "2019-02-02";
    //console.log(test);

    Upload.find({ date: { $gte: test } }).sort({ date: 1}).exec(function (err, uploadsResults){
        //console.log('sorting  ' + uploadsResults);
        res.render('form');
    });


    Upload.find().sort({ date: -1 }).exec(function (err, cursor) {
        //console.log('new ' + cursor);

    });
}); 
//-------------------------------------------------------------------------------------------

// list all events
router.get('/all-events', (req, res) => {
    Upload.find()
        .then((allEvents) => {
            console.log(allEvents);
            res.render('listAllEvents', { title: 'Listing registrations', allEvents });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});
//-------------------------------------------------------------------------------------------

// list event for update
router.get('/:id/event', (req, res) => {
    Upload.findById(req.params.id)
        .then((updateEvent) => {
            res.render('update-event', { title: 'Listing registrations', updateEvent });
        })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
});
//-------------------------------------------------------------------------------------------

//delete events by id
router.get('/:id', (req, res) => {
    console.log("in delete");
    Upload.findByIdAndDelete(req.params.id, function (err) {
        if (err) return next(err);
        res.render('delete');
    });
});
//-------------------------------------------------------------------------------------------

//update events by id
router.post('/:id/update', (req, res) => {
    console.log("in update");
    Upload.Update(req.params.id, function (err, doc) {
        console.log(doc);
        //doc.name = 'thia';

        //doc.save();
    });
});
// object for when no events are scheduled
const dummyObject = [{
    name: 'Your Event Here',
    address: 'Lino Lakes',
    date: '2050-01-01',
    time: '17:00',
    url: '',
    description: 'Gives us a call.  (651)429-4494'
},
    {
    name: 'Events comming soon',
    address: 'Lino Lakes',
    date: '2050-01-01',
    time: '17:00',
    url: '',
    description: 'We are in between sets. Check back often.'

}];


module.exports = router;


//newFunction();



function newFunction() {
    $(document).ready(function() {
        $(".delete").click(function() {
            alert("button");
        });
    });
}
