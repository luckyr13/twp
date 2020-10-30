=== Textile Tools ===
Contributors: criptoalfa
Donate link: https://paypal.me/criptoalfa
Tags: textile, ipfs, buckets, backups, snapshots, s3, filecoin
Requires at least: 4.7
Tested up to: 5.5.2
Stable tag: 5.5.2
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

With this plugin you can have an interface to IPFS, Libp2p and Filecoin from your Wordpress website using the Textile tools.

== Description ==

With our plugin you can upload files from your Wordpress website to IPFS (InterPlanetary File System). All this happens thanks to the tools created by Textile company.

We developed a feature called "Archive: Static Site Generator". With this feature any wordpress admin can create a static copy of their posts and upload it to IPFS in just a few clicks.

Go beyond the limits imposed by your hosting provider. Try IPFS, Textile and our plugin!

== Frequently Asked Questions ==

= How does it work? =

Our plugin is developed using Typescript and relies totally on the JavaScript libraries created by the Textile company. You can visit the Textile docs if you want to know more about how to use their tools: https://docs.textile.io/tutorials/hub/web-app/

So with Typescript we import the Textile libraries needed to create for example Buckets.

You don't need to know how to programm to use this tools. However a good understanding about Textile Tools would help. Please refer to official docs if needed: https://docs.textile.io/hub/

= What is the file admin/js/wptextileplugin_admin.js? =

Because Textile libraries were created using Typescript we need to generate a transpiled file. Nevertheless we include the original Typescript sources that we created so any user can modify this plugin as needed.

= Where are the Typescript sources? =

The typescript files that we developed are on the typescript folder.

== Screenshots ==

1. Archive example
archive_example.png

2. Buckets example
buckets_example.png

== Changelog ==

= 1.0 =
* First stable version


== Upgrade Notice ==

= 1.0 =
* This is our first fully functional version and includes advanced control over buckets
