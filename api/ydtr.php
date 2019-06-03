<?php
define("CURL_TIMEOUT",   2000);
define("URL",            "http://openapi.youdao.com/api");
define("APP_KEY",        "6ed28c7c242f304c"); // 替换为您的应用ID
define("SEC_KEY",        "7Ancsjl3CeCK6gRg0WyOnu3O2TMk7f2i"); // 替换为您的密钥

function do_request($q,$from,$to)
{
                    $salt = create_guid();
                    $args = array(
        'q' => $q,
        'appKey' => APP_KEY,
        'salt' => $salt,
    );
                    $args['from'] = $from;
                    $args['to'] = $to;
                    $args['signType'] = 'v3';
                    $curtime = strtotime("now");
                    $args['curtime'] = $curtime;
                    $signStr = APP_KEY . truncate($q) . $salt . $curtime . SEC_KEY;
                    $args['sign'] = hash("sha256", $signStr);
                    $ret = call(URL, $args);
    return $ret;
}

// 发起网络请求
function call($url, $args=null, $method="post", $testflag = 0, $timeout = CURL_TIMEOUT, $headers=array())
{
                    $ret = false;
                    $i = 0;
    while($ret === false)
    {
        if($i > 1)
            break;
        if($i > 0)
        {
            sleep(1);
        }
                    $ret = callOnce($url, $args, $method, false, $timeout, $headers);
                    $i++;
    }
    return $ret;
}

function callOnce($url, $args=null, $method="post", $withCookie = false, $timeout = CURL_TIMEOUT, $headers=array())
{
                    $ch = curl_init();
    if($method == "post")
    {
                    $data = convert($args);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_POST, 1);
    }
    else
    {
                    $data = convert($args);
        if($data)
        {
            if(stripos($url, "?") > 0)
            {
                    $url .= "&$data";
            }
            else
            {
                    $url .= "?$data";
            }
        }
    }
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    if(!empty($headers))
    {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    if($withCookie)
    {
        curl_setopt($ch, CURLOPT_COOKIEJAR, $_COOKIE);
    }
                    $r = curl_exec($ch);
    curl_close($ch);
    return $r;
}

function convert(&$args)
{
                    $data = '';
    if (is_array($args))
    {
        foreach ($args as $key=>$val)
        {
            if (is_array($val))
            {
                foreach ($val as $k=>$v)
                {
                    $data .= $key.'['.$k.']='.rawurlencode($v).'&';
                }
            }
            else
            {
                    $data .="$key=".rawurlencode($val)."&";
            }
        }
        return trim($data, "&");
    }
    return $args;
}

// uuid generator
function create_guid(){
                    $microTime = microtime();
    list($a_dec, $a_sec) = explode(" ", $microTime);
                    $dec_hex = dechex($a_dec* 1000000);
                    $sec_hex = dechex($a_sec);
    ensure_length($dec_hex, 5);
    ensure_length($sec_hex, 6);
                    $guid = "";
                    $guid .= $dec_hex;
                    $guid .= create_guid_section(3);
                    $guid .= '-';
                    $guid .= create_guid_section(4);
                    $guid .= '-';
                    $guid .= create_guid_section(4);
                    $guid .= '-';
                    $guid .= create_guid_section(4);
                    $guid .= '-';
                    $guid .= $sec_hex;
                    $guid .= create_guid_section(6);
    return $guid;
}

function create_guid_section($characters){
                    $return = "";
    for($i = 0; $i < $characters; $i++)
    {
                    $return .= dechex(mt_rand(0,15));
    }
    return $return;
}

function truncate($q) {
                    $len = strlen($q);
    return $len <= 20 ? $q : (substr($q, 0, 10) . $len . substr($q, $len - 10, $len));
}

function ensure_length(&$string, $length){
                    $strlen = strlen($string);
    if($strlen < $length)
    {
                    $string = str_pad($string, $length, "0");
    }
    else if($strlen > $length)
    {
                    $string = substr($string, 0, $length);
    }
}


$lang = $_GET['lang'];
$word = $_GET['word'];
header('Content-Type:application/json');
#echo json_encode($_GET);

switch ($lang) {
    case 'zh':
        echo do_request($word,"auto","zh-CHS");
        break;
    
    case 'jp':
        echo do_request($word,"auto","ja");
        break;

    case 'en':
        echo do_request($word,"auto","en");
        break;
    
    case 'ru':
        echo do_request($word,"auto","ru");
        break;
    default:
        echo do_request($word,"auto","zh-CHS");
        break;
}

?>