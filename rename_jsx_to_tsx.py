import os

def rename_jsx_to_tsx(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                old_path = os.path.join(root, file)
                new_path = os.path.join(root, file[:-3] + '.ts')
                os.rename(old_path, new_path)
                print(f"Renamed: {old_path} -> {new_path}")

# Specify the directory where your React files are located
# Replace this with the path to your project's src directory
project_directory = './src'

rename_jsx_to_tsx(project_directory)
print("Renaming complete!")
