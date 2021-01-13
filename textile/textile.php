<?php
/*
Plugin Name: Textile Tools
Plugin URI: https://github.com/luckyr13/twp
Description: Create a Static Site copy/backup of your Wordpress site. Upload it to IPFS and Filecoin with Textile Tools.
Version: 1.8
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
