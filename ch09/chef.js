/**
 * Created by scottmoon on 7/1/15.
 */

process.on('message', function (message, parent) {
    var meal = {};
    switch (message.cmd) {
        case 'makeBreakfast' :
            meal = ['ham', 'eggs', 'toast'];
            break;

        case 'makeLunch' :
            meal = ['bugger', 'fries', 'shake'];
            break;

        case 'makeDinner' :
            meal = ['soup', 'salad', 'steak'];
            break;
    }
    //자식이 부모프로세스에게 메세지를 전달하기 위해 send()함수 사용하여 전달
    process.send(meal);
});
