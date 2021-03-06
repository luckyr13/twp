<?php
/*
Plugin Name: Textile Tools
Plugin URI: https://github.com/luckyr13/twp
Description: Create a static copy/backup for your Wordpress posts. Host a static copy of your entire website on IPFS and Filecoin with Textile Tools. Decentralized storage at your hands. Welcome to the new web era! Are you ready?
Version: 2.6
Author: Ricardo Guzman
Author URI: http://criptoalfa.com
License:           GPL v2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html
*/

if ( !class_exists( 'WPTextilePlugin' ) ) {
    // Import Textile library
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'includes' . 
        DIRECTORY_SEPARATOR . 'WPTextilePlugin.php';

    $WPTextilePlugin = new WPTextilePlugin();
    register_activation_hook( __FILE__, array( $WPTextilePlugin, 'activate' ) );
    register_deactivation_hook( __FILE__, array( $WPTextilePlugin, 'deactivate' ) );
}
