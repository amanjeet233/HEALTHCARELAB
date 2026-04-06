import random
import os

categories = [
    "CBC", "Thyroid", "Diabetes", "Lipid", "Liver", 
    "Kidney", "Urine", "Hormones", "Vitamins", "Cancer Markers"
]

sub_categories_map = {
    "CBC": ["Complete Blood Count", "Hemogram", "Erythrocytes", "Leukocytes"],
    "Thyroid": ["T3/T4/TSH", "Antibodies", "Thyroid Profile Expanded"],
    "Diabetes": ["HBA1C", "Fasting", "PP", "Insulin", "Glucose Tolerance"],
    "Lipid": ["Total Cholesterol", "Triglycerides", "HDL/LDL", "Lipoprotein"],
    "Liver": ["SGOT/SGPT", "Bilirubin", "Alkaline Phosphatase", "Liver Profile Advanced"],
    "Kidney": ["Creatinine", "Urea", "Uric Acid", "Electrolytes", "BUN"],
    "Urine": ["Routine", "Microscopy", "Culture", "Protein", "Ketones"],
    "Hormones": ["Testosterone", "Estrogen", "Progesterone", "Cortisol", "FSH/LH", "Prolactin"],
    "Vitamins": ["Vitamin D", "Vitamin B12", "Folic Acid", "Vitamin K", "Calcium"],
    "Cancer Markers": ["PSA", "CA-125", "CEA", "AFP", "CA 19-9", "CA 15-3"]
}

adjectives = ["Advanced", "Comprehensive", "Basic", "Complete", "Routine", "Profile", "Screening", "Panel", "Test"]

description_texts = [
    "This test helps in evaluating the general health and functioning of the respective system.",
    "A comprehensive screening to detect potential abnormalities in your body's early stages.",
    "Essential for regular monitoring and prescribed routinely by physicians.",
    "This panel provides a detailed measure of specific parameters for precise diagnosis.",
    "Designed for individuals seeking an in-depth understanding of their well-being."
]

def generate_slug(name, id_num):
    return name.lower().replace(" ", "-").replace("/", "-") + f"-{id_num}"

def escape_sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return '1' if value else '0'
    if isinstance(value, (int, float)):
        return str(value)
    # string
    return "'" + str(value).replace("'", "''") + "'"

def generate_test(id_num):
    cat = random.choice(categories)
    sub_cat = random.choice(sub_categories_map[cat])
    
    # name creation
    adj = random.choice(adjectives)
    name = f"{sub_cat} {adj}"
    
    # deduplicate name by adding id or somewhat unique
    # Actually just add roman numerals or numbers randomly if needed, but ID makes it unique
    if random.random() < 0.3:
        name = f"{name} {random.randint(1, 10)}"
        
    slug = generate_slug(name, id_num)
    
    # pricing: realistic Indian rupees. 500 to 10000
    original_price = random.randint(5, 100) * 100 # 500 to 10000 step 100
    if random.random() < 0.2:
        original_price = random.randint(1, 4) * 100 # cheaper tests
        
    # the user asked for EXACTLY 60% discount applied
    discount_percent = 60
    discounted_price = original_price * (100 - discount_percent) / 100.0
    
    parameters_count = random.randint(1, 80)
    
    description = random.choice(description_texts)
    
    recommended_for = random.choice(["Male, Female", "Male", "Female", "Kids", "Seniors", "All Age Groups"])
    fasting_required = random.choice([True, False])
    report_time_hours = random.choice([12, 24, 36, 48, 72])
    
    is_top_booked = random.random() < 0.15 # 15% top booked
    is_top_deal = random.random() < 0.10 # 10% top deal
    
    tags = str([cat, sub_cat, "Health", "Apollo"]).replace("'", '"')
    
    # icon url dummy
    icon_url = f"https://cdn.apollo247.com/files/icons/{cat.lower()}.png"
    
    is_package = random.random() < 0.2 # 20% are packages
    
    return {
        "id": id_num,
        "name": name,
        "slug": slug,
        "category": cat,
        "sub_category": sub_cat,
        "original_price": original_price,
        "discounted_price": int(discounted_price),
        "discount_percent": discount_percent,
        "parameters_count": parameters_count,
        "description": description,
        "recommended_for": recommended_for,
        "fasting_required": fasting_required,
        "report_time_hours": report_time_hours,
        "is_top_booked": is_top_booked,
        "is_top_deal": is_top_deal,
        "tags": tags,
        "icon_url": icon_url,
        "is_package": is_package,
        "is_active": True,
        "price": int(discounted_price) # Setting active price to discounted price
    }


def generate_sql():
    sql = "INSERT INTO tests (id, name, slug, category, sub_category, original_price, discounted_price, discount_percent, parameters_count, description, recommended_for, fasting_required, report_time_hours, is_top_booked, is_top_deal, tags, icon_url, is_package, price, is_active) VALUES \n"
    
    values_list = []
    for i in range(1, 1001):
        t = generate_test(i)
        val = f"({escape_sql(t['id'])}, {escape_sql(t['name'])}, {escape_sql(t['slug'])}, {escape_sql(t['category'])}, {escape_sql(t['sub_category'])}, {escape_sql(t['original_price'])}, {escape_sql(t['discounted_price'])}, {escape_sql(t['discount_percent'])}, {escape_sql(t['parameters_count'])}, {escape_sql(t['description'])}, {escape_sql(t['recommended_for'])}, {escape_sql(t['fasting_required'])}, {escape_sql(t['report_time_hours'])}, {escape_sql(t['is_top_booked'])}, {escape_sql(t['is_top_deal'])}, {escape_sql(t['tags'])}, {escape_sql(t['icon_url'])}, {escape_sql(t['is_package'])}, {escape_sql(t['price'])}, {escape_sql(t['is_active'])})"
        values_list.append(val)
        
    sql += ",\n".join(values_list) + ";\n"
    return sql

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, "database", "1000_tests_seed.sql")
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w') as f:
        f.write("-- 1000+ Lab Tests Seed Data\n")
        f.write("-- Auto-generated mock data for tests table\n\n")
        # Need to disable foreign key checks / constraint checks if we insert blindly
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("TRUNCATE TABLE tests;\n")
        # Ensure we write only if needed
        f.write(generate_sql())
        f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
        
    print(f"Successfully generated {output_file}")
