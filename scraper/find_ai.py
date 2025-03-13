from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from seleniumbase import Driver
import pandas as pd
import time
from selenium.common.exceptions import NoSuchElementException

# Function to open a link and handle CAPTCHA
def open_link(link, driver):
    driver.uc_open_with_reconnect(link, 4)
    driver.uc_gui_click_captcha()
    return driver

# Initialize the Selenium driver
driver = Driver(uc=True)

# Ask the user for their choice
choice = input("Do you want to scrape all tools or only new tools? (all/new): ").strip().lower()

# Open the main website
driver = open_link('https://theresanaiforthat.com/', driver)
wait = WebDriverWait(driver, 50)

# Wait for the sign-in modal to appear and dismiss it
element = wait.until(EC.presence_of_element_located((By.XPATH, '//div[@id="signin_modal" and @class="modal"]')))
driver.find_element(By.XPATH, '//body').send_keys(Keys.ESCAPE)

# Initialize a list to store main links
main_links = []

if choice == 'all':
    # Collect all category links
    for elem in driver.find_elements(By.XPATH, '//div[@class="letter_inner"]'):
        main_links.append(elem.find_element(By.XPATH, './/h2//a').get_attribute('href'))
elif choice == 'new':
    # Navigate to the "Just Released" page
    just_released_url = 'https://theresanaiforthat.com/just-released/'
    driver = open_link(just_released_url, driver)
    time.sleep(2)
    driver.find_element(By.XPATH, '//body').send_keys(Keys.END)
    time.sleep(1)
    main_links = [just_released_url]

# Initialize a list to store all tool data
all_data = []

# Loop through each main link and collect tool URLs
for link in main_links:
    driver = open_link(link, driver)
    time.sleep(2)
    driver.find_element(By.XPATH, '//body').send_keys(Keys.END)
    time.sleep(1)
    count_element = driver.find_element(By.XPATH, '//div[@id="records_count"]').text
    count = int(count_element.split()[0].replace(',', ''))
    pages = count // 200 + 1
    for pg in range(1, pages + 1):
        page_url = f"{link}page/{pg}/"
        driver = open_link(page_url, driver)
        for tool in driver.find_elements(By.XPATH, '//div[@class="tasks"]//li'):
            tool_url = tool.find_element(By.XPATH, './/a[@class="stats"]').get_attribute('href')
            tools_dict = {"url": tool_url}  # Removed "Time Period" column
            all_data.append(tools_dict)
        print(f"Scraped page {pg} of {pages} for {link.split('/')[-2]}")
        

# Handle scraping based on user choice
if choice == 'all':
    # Scrape all tools
    df = pd.DataFrame(all_data)
    df.drop_duplicates(keep='first', ignore_index=True)
    required_columns = ['url', 'tool_name', 'logo_url', 'primary_tag', 'other_tags', 
                        'pricing', 'excerpt', 'description', 'Link to tool']
    for col in required_columns:
        if col not in df.columns:
            if col == 'other_tags':
                # Initialize with empty lists
                df[col] = [[] for _ in range(len(df))]
            else:
                # Initialize with empty strings
                df[col] = ''
    print("Total tools to scrape:", len(df))
    # driver = Driver(uc=True)
    for index, row in df.iterrows():
        url = row['url']
        driver = open_link(url, driver)
        
        # Extract tool details with exception handling
        try:
            df.at[index, 'tool_name'] = driver.find_element(By.XPATH, '//h1[@class="title_inner"]').text
        except NoSuchElementException:
            df.at[index, 'tool_name'] = ''
        
        try:
            df.at[index, 'logo_url'] = driver.find_element(By.XPATH, '//div[@class="icon_wrap_outer l"]//img[@class="taaft_icon"]').get_attribute('src')
        except NoSuchElementException:
            df.at[index, 'logo_url'] = ''
        
        try:
            df.at[index, 'primary_tag'] = driver.find_element(By.XPATH, '//div[@class="stats"]//a[@class="task_label"]').text
        except NoSuchElementException:
            df.at[index, 'primary_tag'] = ''
        
        try:
            df.at[index, 'other_tags'] = [tag.text for tag in driver.find_elements(By.XPATH, '//div[@class="tags"]//a[@class="tag"]')]
        except NoSuchElementException:
            df.at[index, 'other_tags'] = []
        
        try:
            df.at[index, 'pricing'] = driver.find_element(By.XPATH, '//div[@class="tags"]//span[@class="tag price"]').text
        except NoSuchElementException:
            df.at[index, 'pricing'] = ''
        
        try:
            df.at[index, 'excerpt'] = driver.find_element(By.XPATH, '//header[@id="overview"]//div[@id="use_case"]').text
        except NoSuchElementException:
            df.at[index, 'excerpt'] = ''
        
        try:
            driver.execute_script("document.querySelectorAll(' .social_icons, .attribution_wrap, #ai_features_list').forEach(e => e.remove());")
            df.at[index, 'description'] = driver.find_element("css selector", ".description.ai_description").text
        except NoSuchElementException:
            df.at[index, 'description'] = ''
        
        try:
            df.at[index, 'Link to tool'] = driver.find_element(By.XPATH, '//a[@class="ai_top_link visit_website_btn"]').get_attribute('href')
        except NoSuchElementException:
            df.at[index, 'Link to tool'] = ''
        
        print(f"Scraped tool {index + 1}: {df.at[index, 'tool_name']}")

    # Save the DataFrame to a JSON file
    df.to_json('ai_tools.json', orient='records', indent=4)
    print("All tools scraped and saved to 'ai_tools.json'.")

else:
    # Handle new tools
    try:
        existing_df = pd.read_json('ai_tools.json')
    except FileNotFoundError:
        existing_df = pd.DataFrame(columns=['url', 'tool_name', 'logo_url', 'primary_tag', 'other_tags', 'pricing', 'excerpt', 'description', 'Link to tool'])
    
    # Identify new tools
    new_urls = [tool['url'] for tool in all_data]
    existing_urls = existing_df['url'].tolist() if not existing_df.empty else []
    new_tools = [tool for tool in all_data if tool['url'] not in existing_urls]
    
    if not new_tools:
        print("No new tools found.")
        existing_df.to_json('ai_tools.json', orient='records', indent=4)
        driver.quit()
        exit()
    
    # Scrape details for new tools
    temp_df = pd.DataFrame(new_tools)
    temp_df.drop_duplicates(keep='first', ignore_index=True)
    print("Total tools to scrape:", len(temp_df))
    # Ensure all required columns are present with appropriate defaults
    required_columns = ['url', 'tool_name', 'logo_url', 'primary_tag', 'other_tags', 
                        'pricing', 'excerpt', 'description', 'Link to tool']
    for col in required_columns:
        if col not in temp_df.columns:
            if col == 'other_tags':
                # Initialize with empty lists
                temp_df[col] = [[] for _ in range(len(temp_df))]
            else:
                # Initialize with empty strings
                temp_df[col] = ''
    
    # driver = Driver(uc=True)
    for index, row in temp_df.iterrows():
        url = row['url']
        driver = open_link(url, driver)
        
        # Extract tool details with exception handling
        try:
            temp_df.at[index, 'tool_name'] = driver.find_element(By.XPATH, '//h1[@class="title_inner"]').text
        except NoSuchElementException:
            temp_df.at[index, 'tool_name'] = ''
        
        try:
            temp_df.at[index, 'logo_url'] = driver.find_element(By.XPATH, '//div[@class="icon_wrap_outer l"]//img[@class="taaft_icon"]').get_attribute('src')
        except NoSuchElementException:
            temp_df.at[index, 'logo_url'] = ''
        
        try:
            temp_df.at[index, 'primary_tag'] = driver.find_element(By.XPATH, '//div[@class="stats"]//a[@class="task_label"]').text
        except NoSuchElementException:
            temp_df.at[index, 'primary_tag'] = ''
        
        try:
            # Removed the check and type conversion; directly assign
            temp_df.at[index, 'other_tags'] = [tag.text for tag in driver.find_elements(By.XPATH, '//div[@class="tags"]//a[@class="tag"]')]
        except NoSuchElementException:
            temp_df.at[index, 'other_tags'] = []
        
        try:
            temp_df.at[index, 'pricing'] = driver.find_element(By.XPATH, '//div[@class="tags"]//span[@class="tag price"]').text
        except NoSuchElementException:
            temp_df.at[index, 'pricing'] = ''
        
        try:
            temp_df.at[index, 'excerpt'] = driver.find_element(By.XPATH, '//header[@id="overview"]//div[@id="use_case"]').text
        except NoSuchElementException:
            temp_df.at[index, 'excerpt'] = ''
        
        try:
            driver.execute_script("document.querySelectorAll(' .social_icons, .attribution_wrap, #ai_features_list').forEach(e => e.remove());")
            temp_df.at[index, 'description'] = driver.find_element("css selector", ".description.ai_description").text
        except NoSuchElementException:
            temp_df.at[index, 'description'] = ''
        
        try:
            temp_df.at[index, 'Link to tool'] = driver.find_element(By.XPATH, '//a[@class="ai_top_link visit_website_btn"]').get_attribute('href')
        except NoSuchElementException:
            temp_df.at[index, 'Link to tool'] = ''
        
        print(f"Scraped new tool {index + 1}: {temp_df.at[index, 'tool_name']}")

    # Combine new tools with existing data
    updated_df = pd.concat([temp_df, existing_df], ignore_index=True)
    updated_df.to_json('ai_tools.json', orient='records', indent=4)
    print("New tools scraped and saved to 'ai_tools.json'.")

# Close the driver
driver.quit()