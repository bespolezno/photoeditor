<?php
function getImage($type, $path) {
    switch ($type) {
        case 'jpeg':
        case 'jpg':
            return imagecreatefromjpeg($path);
            break;
        case 'png':
            return imagecreatefrompng($path);
            break;
        default:
            return null;
    }
}
function resize($oldImage, $newWidth, $newHeight) {
    $width = imagesx($oldImage);
    $height = imagesy($oldImage);
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    imagecopyresized($newImage, $oldImage, 0, 0, 0, 0,
        $newWidth, $newHeight, $width, $height);
    imagedestroy($oldImage);
    return $newImage;
}
function applyFilters($image, $filters) {
    foreach ($filters as $filter => $val)
        imagefilter($image, strtoupper($filter), $val);
}
$meta = json_decode($_POST['json']);
var_dump($meta);

$imo = getImage(str_replace('image/', '', $_FILES['file']['type']),
    $_FILES['file']['tmp_name']);
$im = resize($imo, $meta['width'], $meta['height']);

//imagecopymerge($im, $stamp, );
//// Сохранение фотографии в файл и освобождение памяти
//imagepng($im, 'photo_stamp.png');
//imagedestroy($im);
//{
//    let fd = new FormData();
//    fd.append('file', $('#file').get()[0].files[0]);
//    fd.append('json', JSON.stringify(compile()));
//    $.ajax('/script.php', {
//        contentType: false,
//        method: 'POST',
//        processData: false,
//        data: fd,
//        success: res => console.log(res)
//    });
//}