# minecraft-ss-website
This is a helpfull ss website for mcwin10

 _   _                 _ _ _         _ _ _ _ _ _
| | | |               |_   _|      /  ___/  ___| 
| |_| | _____      __   | | ___    \ `--.\ `--.  
|  _  |/ _ \ \ /\ / /   | |/ _ \    `--. \`--. \ 
| | | | (_) \ V  V /    | | (_) |  /\__/ /\__/ / 
\_| |_/\___/ \_/\_/     \_/\___/   \____/\____/  
                                                 
                                                
1. First of all, start by looking at the places given.  (desktop, download folder, Recycle bin)

2. Make sure that the explorer has these options checked. (File name extension, Hidden items)

3. next search on something called "Temp Folders" -> Open the "Run" window by using windowsKey + r (type %temp%, temp and prefetch) scheme through the folder for any suspicious file extension.

4. Powershell Search, we will be using "Powershell"
    Type the command-> Get-ChildItem -recurse "*exe" <- what this does it searches ALL the .exe things the person has on his / hers PC
    It shows you what, when they used the programmes.

5. Search Everything -> this is a very easy tool to use because you just have to type the things you want search. (If you see any hack client with the same week used, you know what to do...)

6. Process hacker 2 -> Is a string searching tool.
    Search for the process called "explorer.exe"
    Open it and go to the Memory Tab
    do the "String search" with these options. (Minimum length-> 4, and check every other option.)
    After the search is complete use the "Filter" option. (ALWAYS USE CASE-SENSITIVE)
    Search for the client you need to find or guess with the names "Autoclicker, Clicker, cheatengine, and more..."
    To be clear -> IF you find ALOT of strings with the same name as "Autoclicker" <-> Or any other client name, that DOES NOT INCLUDE A PATH -> Means it is pretty useless.
                -> IF you find strings with the same name as "Autoclicker" <-> Or any other client name, that DOES INCLUDE A PATH -> Means there is a client that is being deleted or hidden in that path.

7. "pcaclient" <-- (this has to be searched in Process hacker) what this does it shows us what the PC-Client has executed.
    -> Means what programmes the user has opened and closed in the same day.
   If you search up pcaclient there should be a string called "TRACE 0000 0000 0000"
   Open the string, save the string in the user's desktop and change the extension instead of ".bin" change it to -> ".txt"
   After you open it look for Traces. if you see any suspicious Traces -> "Any kind of activity that includes cheating.", go ahead and ban the player.

8. LastActivityViewer -> Shows you the users activity throughout his pc lifetime 
    It might seem confusing at first sight but I will simplify it for you.
    -> Scroll down to where the user first opened Anydesk.
    -> if you see any kind of client or Autoclickers that have been used before the Anydesk activity you can go ahead and ban the player.
        -> IF IT IS IN THE SAME DATE AS THE SS DAY OR THE SAME WEEK.
    Or you can use the Search feature to find any Cheat

9. Check if this pc is a "Virtual Machine" <- now to check if it is, there is 2 ways.
	way 1-> Search up "System Info" and look if the pc name and the pc version are not a virtual machine.
	way 2-> RegEdit (Wouldn't recommend it because some Players might not let you access it) If you see the "Computer" name is in another name, it is a different machine (Means a virtual machine)

                                                     /\ 
                                                    |/\|

10. RegEdit Use this link -> Computer\HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Compatibility Assistant\Store
    What this does, it logs every executable program in a key.
    Search the whole thing, if you see any "Keys" of any hack client you can go ahead and deal with the User!
    you can do strg+f to search for more Keys if you would like, but it does take a lot of time.
    DISCLAIMER -> Do not delete or modify any keys in the users pc, because it can break the pc easily!!!!!!

11. Google search history -> strg+h (Works only in chrome)
           |\/|
            \/
12. Google download history -> strg+j (Works only in chrome)

13. Check if the user has a USB plugged in -> Check for an arrow bottom right and see if there is any. -> IF you see any USB, you can go ahead and ask the user -> "for what Purpose does the USB have?"
    There is a program for usb usage history and it can be downloaded in this link, (https://www.nirsoft.net/utils/usbdeview-x64.zip)
    Check if there is anything suspicious. (The blue ones are connected.)

14. Check if they are using macros -> Search if they have the "Razer Synapse" and the "Logitech" program on their pc -> Check if they have macros installed.

15. "Device Manager"
    Search Device Manager on the PC of the user.
    search for the "Mice and other pointing devices"
    see if they have anything other than a Mouse or a Touchpad.

16. Command Prompt C:Drive Search
    Open cmd -> AS ADMINISTRATOR 
    use this following command -> dir /s "Name of the client.exe"
    if nothing pops up, keep searching with names
        if it does find -> it will give you the place of the Client or Autoclicker

17. Screenshare Tools.
    There are a lot of tools to help you SS as best as possible
    I have my own Tool -> Sadly it is a simple Batch file <- In the future I might make it as a Java, so no one can reverse engineer it and be more powerful.
    Good Screenshare tool can be downloaded in -> (https://cdn.discordapp.com/attachments/675380171812896769/675381046136668163/Screenshare_Tool.exe)

         

This Tutorial is free of use, you can modify it or do anything with it because it is yours!
If you have any question please Friend Request me in discord and I'll try my best to help you!
This Tutorial will get updated over time after I get more intelligence because I am a dumb human being. 

made with love ~James
Discord : 𝙅𝙖𝙢𝙚𝙨#3085
Youtube: OnlyJames

Have fun in the future :)
