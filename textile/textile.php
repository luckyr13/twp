<?php
/*
Plugin Name: Textile Tools
Plugin URI: http://textile.io
Description: Backup your Wordpress website by creating html static copies of your posts and uploading it to IPFS thanks to Textile Tools. Create buckets, upload files to IPFS, archive your buckets in Filecoin and more. This is the all-in-one tool that you need to interact nice and easy with IPFS.
Version: 1.0
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
