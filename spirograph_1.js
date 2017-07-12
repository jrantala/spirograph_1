var count = 0;
var t;
var c_canvas;
var c_context;
var cb_canvas;
var cb_context;
var angle;
var x;
var y;

var arm1_angle_mult;
var arm2_angle_mult;
var arm3_angle_mult;
var arm4_angle_mult;
var arm1_radius;
var arm2_radius;
var arm3_radius;
var arm4_radius;
var max_count = 50000;

var last_x = 9999;
var last_y = 9999;
var W = 300;
var H = 300;

var arm_points = [];
var arm_speeds = [];

function canvas_point(e) {
    mouse_x = e.clientX;
    mouse_y = e.clientY;

    c_canvas = document.getElementById("c");
    c_context = c_canvas.getContext("2d");
    c_context.fillStyle = "rgb(255,255,0)";

    if (arm_points.length < 3) {
        arm_points.push(mouse_y);
        arm_speeds.push(mouse_x);
        c_context.beginPath();
	c_context.arc(mouse_x,mouse_y, 10, 0, Math.PI*2);
	c_context.fill();
	c_context.closePath();

    } else {
        start_draw();
    }
}

function stop_counting() {
    count = max_count + 1;
}

function clean() {
    count = max_count + 1;

    arm_points = [];
    arm_speeds = [];
    c_canvas = document.getElementById("c");
    c_context = c_canvas.getContext("2d");
    c_context.fillStyle = "rgb(0,0,0)";

    c_context.fillRect(0,0, W, H);

    c_context.fillStyle    = '#00f';
    c_context.font         = 'italic 30px sans-serif';
    c_context.textBaseline = 'top';
    c_context.fillText('- Spin Rate +', 50,270);

    c_context.translate(W/2, H/2);
    c_context.rotate(-Math.PI/2);
    c_context.translate(-W/2, -H/2);
    c_context.fillText('     - arm length +', W/2-150, 10);
    c_context.translate(W/2, H/2);
    c_context.rotate(Math.PI/2);
    c_context.translate(-W/2, -H/2);
}

function get_angle(n, count) {
    return count * Math.PI/360.0 * n;
}

function get_arm_lengths() {
    var combined = 0;
    for (var i = 0; i< arm_points.length; i++) {
        combined += arm_points[i];
    }
    var lengths = [];
    for (var i = 0; i< arm_points.length; i++) {
        length = Math.floor((W/2 - 3) * arm_points[i]/combined);
        lengths.push(length);
    }
    return lengths;
}

function get_arm_angle_mults() {
    var mults = [];
    for (var i=0; i<arm_speeds.length; i++) {
        mults.push((W/2.0 - arm_speeds[i]) / 15.0);
    }
    return mults;
}

function start_draw(mx,my) {
    c_canvas = document.getElementById("c");
    c_context = c_canvas.getContext("2d");

    cb_canvas = document.createElement('canvas');
    cb_canvas.width = c_canvas.width;
    cb_canvas.height = c_canvas.height;
    cb_context = cb_canvas.getContext('2d');

    c_context.lineWidth = 4;
    cb_context.lineWidth = 4;
    c_context.fillStyle = "rgb(0,0,0)";
    c_context.fillRect(0,0, W, H);

    last_x = 9999;
    last_y = 9999;

    count = 0;
    arm_lengths = get_arm_lengths();
    arm1_radius = arm_lengths[0];
    arm2_radius = arm_lengths[1];
    arm3_radius = arm_lengths[2];

    arm_angle_mults = get_arm_angle_mults();
    arm1_angle_mult = arm_angle_mults[0];
    arm2_angle_mult = arm_angle_mults[1];
    arm3_angle_mult = arm_angle_mults[2];
    
    draw();
}

function arm(count, radius, n) {
    angle = get_angle(n, count)
    xt = Math.cos(angle) * radius;
    yt = Math.sin(angle) * radius;
    return [xt,yt];
}

function draw() {

    xy1 = arm(count, arm1_radius, arm1_angle_mult);
    xy2 = arm(count, arm2_radius, arm2_angle_mult);
    xy3 = arm(count, arm3_radius, arm3_angle_mult);

    angle3 = get_angle(arm3_angle_mult, count)
    r = get_intensity(0, angle3)
    g = get_intensity(120, angle3);
    b = get_intensity(240, angle3);

    var color_str = 'rgb(' + r + ',' + g + ',' + b + ')';
    cb_context.strokeStyle = color_str;

    x = W/2 + xy1[0] + xy2[0] + xy3[0];
    y = H/2 + xy1[1] + xy2[1] + xy3[1];

    if (last_x == 9999) {
        last_x = x;
        last_y = y;
    } else if (count < max_count) {
        cb_context.lineWidth = 2;
        cb_context.beginPath();
        cb_context.moveTo(last_x, last_y);
        cb_context.lineTo(x,y);
        cb_context.stroke();
        cb_context.closePath();
        last_x = x;
        last_y = y;

        c_context.fillStyle = "rgb(0,0,0)";
        c_context.fillRect(0,0, W, H);
        c_context.drawImage(cb_canvas, 0,0);

        c_context.lineWidth = 2;
        c_context.strokeStyle = 'rgb(127,127,127)';
        c_context.beginPath();
        c_context.moveTo(W/2, H/2);
        c_context.lineTo(W/2+xy1[0], H/2+xy1[1]);
        c_context.stroke();
        c_context.closePath();

        c_context.strokeStyle = 'rgb(100,100,100)';
        c_context.beginPath();
        c_context.moveTo(W/2+xy1[0], H/2+xy1[1]);
        c_context.lineTo(W/2+xy1[0]+xy2[0], H/2+xy1[1]+xy2[1]);
        c_context.stroke();
        c_context.closePath();
        
        c_context.strokeStyle = 'rgb(80,80,80)';
        c_context.beginPath();
        c_context.moveTo(W/2+xy1[0]+xy2[0], H/2+xy1[1]+xy2[1]);
        c_context.lineTo(W/2+xy1[0]+xy2[0]+xy3[0], H/2+xy1[1]+xy2[1]+xy3[1]);
        c_context.stroke();
        c_context.closePath();
        
    }

    if (count < max_count) {
        t=setTimeout("draw()", 1);
    }

    count = count + 1;

}

function get_intensity(offset, angle) {
    angle = Math.abs(360 * angle / (2 * Math.PI));

    var a = (offset + angle) % 360;

    var intensity = 255;
    if (a <= 60) {
        intensity = Math.floor(255 * a / 60);
    }
    if (a >= 180 && a < 240) {
        intensity = Math.floor(255 * (240 - a) / 60);
    }
    if (a >= 240) {
        intensity = 0;
    }

    return intensity;
}
