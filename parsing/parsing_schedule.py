import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

params = {
    'date_gte': '2026-04-27',
    'date_lte': '2026-04-27'
}

response = requests.get('https://urfu.ru/api/v2/schedule/groups?search=МЕН', headers=headers, timeout=10)
data = response.json()

#print(response.status_code)

needed_keys = ['date', 'pairNumber', 'auditoryTitle', 'auditoryLocation']


def check_address_and_auditory(subject):
    # Проверяем, что auditoryTitle существует и не None
    auditory_title = subject.get('auditoryTitle')
    if auditory_title is None or len(auditory_title) == 0:
        return False
    
    # Проверяем location
    auditory_location = subject.get('auditoryLocation')
    
    if (auditory_location is not None and 'Тургенева, 4' in auditory_location 
        and (auditory_title[0] == '6' or auditory_title[0] == '5')):
        return True
    return False

def filter_events(events):
    filtered_list = []
    filtered_item = {}
    for subject in events:
        filtered_item = {}
        if (check_address_and_auditory(subject)):
            for key in needed_keys:
                if key in subject:
                    value = subject[key]
                    filtered_item[key] = value
    
        if filtered_item:
            filtered_list.append(filtered_item)
    return filtered_list

room_taken_pairs = dict()
def add_room_takings(filtered_list):
    for subject in filtered_list:
        room_number = subject['auditoryTitle']
        pair_number = subject['pairNumber']
        if (not room_number in room_taken_pairs):
            room_taken_pairs[room_number] = []
        if (not pair_number in room_taken_pairs[room_number]):
            room_taken_pairs[room_number].append(pair_number)

for group in data:
    group_id = group['id']
    print(group['title'])
    response = requests.get(f'https://urfu.ru/api/v2/schedule/groups/{group_id}/schedule', headers=headers, params=params, timeout=10)
    group_data = response.json()

    filtered_list = filter_events(group_data['events'])

    print(filtered_list)
    print(group_data.get)
    add_room_takings(filtered_list)

print(room_taken_pairs)

with open('rooms.json', 'w', encoding='utf-8') as f:
    json.dump(room_taken_pairs, f)
